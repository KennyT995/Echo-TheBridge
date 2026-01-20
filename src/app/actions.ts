'use server';

import {
  generateRoadmapFromVision,
  GenerateRoadmapFromVisionOutput,
  GenerateRoadmapFromVisionInput,
} from '@/ai/flows/generate-roadmap-from-vision';
import {
  analyzeAndReflectOnUserInput,
  type AnalyzeAndReflectOnUserInputOutput,
} from '@/ai/flows/analyze-and-reflect-on-user-input';
import {
  generateVisionIdeas,
  type GenerateVisionIdeasOutput
} from '@/ai/flows/generate-vision-ideas';
import { VisionFormSchema, type VisionFormValues } from '@/lib/types';
import { correctGrammarAndSpelling } from '@/ai/flows/correct-grammar-and-spelling';
import { analyzeVisionIntent, type AnalyzeVisionIntentOutput } from '@/ai/flows/analyze-vision-intent';

export async function analyzeVision(goal: string): Promise<AnalyzeVisionIntentOutput | { error: string }> {
  try {
    const result = await analyzeVisionIntent({ goal });
    return result;
  } catch (error) {
    console.error('Vision analysis failed:', error);
    return { error: 'Failed to analyze vision intent.' };
  }
}


export async function generateRoadmap(
  values: VisionFormValues & Partial<GenerateRoadmapFromVisionInput>,
): Promise<{ roadmap?: GenerateRoadmapFromVisionOutput; correctedGoal?: string; error?: string }> {
  const validatedFields = VisionFormSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      error: 'Invalid fields. Please ensure your goal is descriptive enough.',
    };
  }

  try {
    // First, correct the grammar of the goal.
    const correctionResult = await correctGrammarAndSpelling({ text: validatedFields.data.goal });
    const correctedGoal = correctionResult.correctedText;

    // Then, generate the roadmap with the corrected goal.
    const roadmap = await generateRoadmapFromVision({
      title: validatedFields.data.title,
      goal: correctedGoal,
      yearlyFocus: values.yearlyFocus,
      monthlyFocus: values.monthlyFocus,
      weeklyFocus: values.weeklyFocus,
      dailyFocus: values.dailyFocus,
      completedTasks: values.completedTasks,
    });
    return { roadmap, correctedGoal };
  } catch (error: unknown) {
    console.error('Error in generateRoadmap:', error);
    let errorMessage = '';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Check for AI flow related errors
    if (errorMessage.includes('AI') || errorMessage.includes('flow') || errorMessage.includes('genkit')) {
      return {
        error:
          'An unexpected error occurred while generating your roadmap with the AI. Please try again later.',
      };
    }
    // Generic fallback error
    return {
      error: 'An unexpected error occurred while generating your roadmap. Please try again.',
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

export async function getVisionIdeas(keywords: string): Promise<{ ideas?: string[]; error?: string }> {
  if (!keywords) {
    return { error: 'Please provide at least one keyword.' };
  }
  try {
    const result: GenerateVisionIdeasOutput = await generateVisionIdeas({ keywords });
    return { ideas: result.ideas };
  } catch (error) {
    console.error('Vision idea generation failed:', error);
    return {
      error: 'An unexpected error occurred while generating ideas. Please try again.',
    };
  }
}

import { firestore } from '@/firebase/admin';

export async function deleteVision(visionId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  if (!visionId || !userId) {
    return { success: false, error: 'Missing visionId or userId' };
  }

  try {
    // Note: In a real production app, verify the session cookie or ID token here to ensure
    // the request comes from 'userId'. 

    // Check if vision belongs to user
    const visionRef = firestore.collection('users').doc(userId).collection('visions').doc(visionId);
    const visionSnap = await visionRef.get();

    if (!visionSnap.exists) {
      return { success: false, error: 'Vision not found' };
    }

    // Recursively delete vision (includes roadmaps if nested, but roadmaps are usually sibling or root collections
    // In this app: Roadmaps are in users/{userId}/roadmaps/{visionId} usually, OR linked.
    // Based on DashboardPage: collection(firestore, 'users', user.uid, 'roadmaps')
    // So we need to delete the Roadmap document too.

    const roadmapRef = firestore.collection('users').doc(userId).collection('roadmaps').doc(visionId);

    // Use bulkWriter for recursive delete if subcollections exist, but simpler delete is fine for single docs
    // But Vision might have subcollections? Assuming no subcollections for Vision doc itself based on 'VisionForm'.

    await visionRef.delete();
    await roadmapRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Delete vision failed:', error);
    return { success: false, error: 'Failed to delete vision' };
  }
}

import { generateDailyBriefing, GenerateDailyBriefingInput, GenerateDailyBriefingOutput } from '@/ai/flows/generate-daily-briefing';

export async function getDailyBriefing(input: GenerateDailyBriefingInput): Promise<{ briefing?: GenerateDailyBriefingOutput; error?: string }> {
  try {
    const briefing = await generateDailyBriefing(input);
    return { briefing };
  } catch (error) {
    console.error('Daily briefing generation failed:', error);
    return { error: 'Failed to generate daily briefing.' };
  }
}

import { generateFutureSelfChat, GenerateFutureSelfChatInput, GenerateFutureSelfChatOutput } from '@/ai/flows/generate-future-self-chat';

export async function getFutureSelfChat(input: GenerateFutureSelfChatInput): Promise<{ response?: GenerateFutureSelfChatOutput; error?: string }> {
  try {
    const chatResponse = await generateFutureSelfChat(input);
    return { response: chatResponse };
  } catch (error) {
    console.error('Future self chat failed:', error);
    return { error: 'Failed to connect to your future self.' };
  }
}
