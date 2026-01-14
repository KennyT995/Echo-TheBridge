import { z } from 'zod';
import type { GenerateRoadmapFromVisionOutput } from '@/ai/flows/generate-roadmap-from-vision';

const VisionCategorySchema = z.object({
  career: z.string().optional(),
  health: z.string().optional(),
  relationships: z.string().optional(),
  legacy: z.string().optional(),
});

export const VisionFormSchema = z.object({
  twoYearVision: VisionCategorySchema,
  fiveYearVision: VisionCategorySchema,
  tenYearVision: VisionCategorySchema,
});

export type VisionFormValues = z.infer<typeof VisionFormSchema>;
export type Roadmap = GenerateRoadmapFromVisionOutput;
