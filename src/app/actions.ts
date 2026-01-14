'use server';

import {
  generateRoadmapFromVision,
} from '@/ai/flows/generate-roadmap-from-vision';
import {
  analyzeAndReflectOnUserInput,
  type AnalyzeAndReflectOnUserInputOutput,
} from '@/ai/flows/analyze-and-reflect-on-user-input';
import { VisionFormSchema, type VisionFormValues } from '@/lib/types';
import { getFirestore, doc, setDoc, serverTimestamp, FirestoreError } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// This function correctly initializes Firebase for server-side actions.
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
    // Generate the roadmap first. If this fails, we won't write to the DB.
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
    await setDoc(visionRef, visionData);

    const roadmapRef = doc(db, 'users', userId, 'roadmaps', visionId);
    await setDoc(roadmapRef, roadmapData);

    return { visionId };

  } catch (error: any) {
    console.error('Error in generateAndSaveRoadmap:', error);
    
    // Check if it's a Firestore permission error
    if (error instanceof FirestoreError && error.code === 'permission-denied') {
        // This is a more specific error message that can guide the user.
        return { error: 'You have reached the maximum number of visions for your current plan. Please upgrade your plan to create more.' };
    }
    
    // Check for AI flow related errors
    if (error.message.includes('AI') || error.message.includes('flow')) {
         return {
            error:
            'An unexpected error occurred while generating your roadmap with the AI. Please try again later.',
        };
    }

    // Generic fallback error
    return {
      error: 'An unexpected error occurred while saving your vision. Please check your permissions or try again.',
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
