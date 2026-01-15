'use server';

import {
  generateRoadmapFromVision,
  GenerateRoadmapFromVisionOutput,
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


export async function generateRoadmap(
  values: VisionFormValues,
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
        ...validatedFields.data,
        goal: correctedGoal,
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
