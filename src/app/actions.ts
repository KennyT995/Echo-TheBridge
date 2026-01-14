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
  if (!validatedFields.success) {
    return {
      error: 'Invalid fields. Please ensure your goal is descriptive enough.',
    };
  }

  const db = getDb();
  const visionId = nanoid();

  try {
    const roadmap = await generateRoadmapFromVision(validatedFields.data);

    const visionData = {
      ...validatedFields.data,
      id: visionId,
      userId: userId,
      createdAt: serverTimestamp(),
    };

    const roadmapData = {
      ...roadmap,
      id: visionId,
      visionId: visionId,
      userId: userId,
    };

    const visionRef = doc(db, 'users', userId, 'visions', visionId);
    const roadmapRef = doc(db, 'users', userId, 'roadmaps', visionId);

    // Perform writes non-blockingly and handle errors
    setDoc(visionRef, visionData).catch((error) => {
      console.error('Error saving vision:', error);
      const permissionError = new FirestorePermissionError({
        path: visionRef.path,
        operation: 'create',
        requestResourceData: visionData,
      });
      // This will be caught by the FirebaseErrorListener on the client
      errorEmitter.emit('permission-error', permissionError);
    });

    setDoc(roadmapRef, roadmapData).catch((error) => {
      console.error('Error saving roadmap:', error);
      const permissionError = new FirestorePermissionError({
        path: roadmapRef.path,
        operation: 'create',
        requestResourceData: roadmapData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    return { visionId };
  } catch (error) {
    console.error('Roadmap generation AI flow failed:', error);
    return {
      error:
        'An unexpected error occurred while generating your roadmap with the AI. Please try again later.',
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
