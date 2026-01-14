import { z } from 'zod';
import type { GenerateRoadmapFromVisionOutput } from '@/ai/flows/generate-roadmap-from-vision';

const VisionCategorySchema = z.object({
  career: z.string(),
  health: z.string(),
  relationships: z.string(),
  legacy: z.string(),
});

export const VisionFormSchema = z.object({
  twoYearVision: VisionCategorySchema,
  fiveYearVision: VisionCategorySchema,
  tenYearVision: VisionCategorySchema,
});

export type VisionFormValues = z.infer<typeof VisionFormSchema>;
export type Roadmap = GenerateRoadmapFromVisionOutput;
