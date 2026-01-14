'use server';

import {
  generateRoadmapFromVision,
  type GenerateRoadmapFromVisionOutput,
} from '@/ai/flows/generate-roadmap-from-vision';
import {
  analyzeAndReflectOnUserInput,
  type AnalyzeAndReflectOnUserInputOutput,
} from '@/ai/flows/analyze-and-reflect-on-user-input';
import { VisionFormSchema, type VisionFormValues } from '@/lib/types';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { nanoid } from 'nanoid';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Helper to initialize Firebase Admin SDK
let db: any;
if (!getApps().length) {
  const firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp);
} else {
  db = getFirestore();
}

export async function generateAndSaveRoadmap(
  values: VisionFormValues,
  userId: string
): Promise<{ visionId?: string; error?: string }> {
  const validatedFields = VisionFormSchema.safeParse(values);

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
    await setDoc(visionRef, visionData).catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: visionRef.path,
          operation: 'create',
          requestResourceData: visionData,
        })
      );
      throw error; // Re-throw to be caught by the outer try-catch
    });

    // Save Roadmap
    const roadmapData = {
      ...roadmap,
      id: visionId,
      visionId: visionId,
      userId: userId,
    };
    const roadmapRef = doc(db, 'users', userId, 'roadmaps', visionId);
    await setDoc(roadmapRef, roadmapData).catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: roadmapRef.path,
          operation: 'create',
          requestResourceData: roadmapData,
        })
      );
      throw error; // Re-throw to be caught by the outer try-catch
    });

    return { visionId: visionId };
  } catch (error: any) {
    console.error('Roadmap generation or save failed:', error);
    // Provide a more specific error if it's a permission issue from our rules
    if (error.message.includes('permission-denied') || error.name === 'FirebaseError') {
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
