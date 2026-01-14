'use server';

import { generateRoadmapFromVision } from '@/ai/flows/generate-roadmap-from-vision';
import { VisionFormSchema, type VisionFormValues, type Roadmap } from '@/lib/types';

export async function generateRoadmap(
  values: VisionFormValues
): Promise<{ roadmap?: Roadmap; error?: string }> {
  const validatedFields = VisionFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields. Please ensure all vision statements are filled out.',
    };
  }

  try {
    const roadmap = await generateRoadmapFromVision(validatedFields.data);
    return { roadmap };
  } catch (error) {
    console.error('Roadmap generation failed:', error);
    return {
      error: 'An unexpected error occurred while generating your roadmap. Please try again later.',
    };
  }
}
