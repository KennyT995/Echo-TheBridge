'use server';

import {
  generateRoadmapFromVision,
  GenerateRoadmapFromVisionOutput,
} from '@/ai/flows/generate-roadmap-from-vision';
import {
  analyzeAndReflectOnUserInput,
  type AnalyzeAndReflectOnUserInputOutput,
} from '@/ai/flows/analyze-and-reflect-on-user-input';
import { VisionFormSchema, type VisionFormValues } from '@/lib/types';


export async function generateRoadmap(
  values: VisionFormValues,
): Promise<{ roadmap?: GenerateRoadmapFromVisionOutput; error?: string }> {
  const validatedFields = VisionFormSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      error: 'Invalid fields. Please ensure your goal is descriptive enough.',
    };
  }

  try {
    const roadmap = await generateRoadmapFromVision(validatedFields.data);
    return { roadmap };
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
