'use server';

import {
  generateRoadmapFromVision,
} from '@/ai/flows/generate-roadmap-from-vision';
import {
  analyzeAndReflectOnUserInput,
  type AnalyzeAndReflectOnUserInputOutput,
} from '@/ai/flows/analyze-and-reflect-on-user-input';
import { VisionFormSchema, type VisionFormValues } from '@/lib/types';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';


function getDb() {
  if (getApps().length === 0) {
    return getFirestore(initializeApp(firebaseConfig));
  }
  return getFirestore(getApp());
}


export async function generateAndSaveRoadmap(
  values: VisionFormValues,
  userId: string
): Promise<{ visionId?: string; error?: string }> {
  const validatedFields = VisionFormSchema.safeParse(values);
  const db = getDb();

  if (!validatedFields.success) {
    return {
      error:
        'Invalid fields. Please ensure all vision statements are filled out.',
    };
  }

  try {
    const visionId = nanoid();
    const visionData = {
      ...validatedFields.data,
      id: visionId,
      userId: userId,
      createdAt: serverTimestamp(),
    };

    // Generate Roadmap
    const roadmap = await generateRoadmapFromVision(validatedFields.data);

    // Save Vision
    const visionRef = doc(db, 'users', userId, 'visions', visionId);
    setDoc(visionRef, visionData).catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: visionRef.path,
          operation: 'create',
          requestResourceData: visionData,
        })
      );
      // We don't rethrow here to avoid unhandled promise rejection on the client
    });

    // Save Roadmap
    const roadmapData = {
      ...roadmap,
      id: visionId,
      visionId: visionId,
      userId: userId,
    };
    const roadmapRef = doc(db, 'users', userId, 'roadmaps', visionId);
    setDoc(roadmapRef, roadmapData).catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: roadmapRef.path,
          operation: 'create',
          requestResourceData: roadmapData,
        })
      );
    });

    return { visionId: visionId };
  } catch (error: any) {
    console.error('Roadmap generation or save failed:', error);
    if (error.code === 'permission-denied' || error.message?.includes('permission-denied')) {
       return { error: 'You have reached the maximum number of visions for your current plan. Please upgrade your plan to create more.' };
    }
    return {
      error:
        'An unexpected error occurred while generating your roadmap. Please try again later.',
    };
  }
}

export async function getReflection(
  userInput: string,
  vision: string
): Promise<{ strategicBriefing?: string; error?: string }> {
  try {
    const result: AnalyzeAndReflectOnUserInputOutput =
      await analyzeAndReflectOnUserInput({ userInput, vision });
    return { strategicBriefing: result.strategicBriefing };
  } catch (error) {
    console.error('Reflection generation failed:', error);
    return {
      error:
        'An unexpected error occurred while generating your reflection. Please try again.',
    };
  }
}
