import { z } from 'zod';
import type { GenerateRoadmapFromVisionOutput } from '@/ai/flows/generate-roadmap-from-vision';
import { serverTimestamp } from 'firebase/firestore';

const VisionCategorySchema = z.object({
  career: z.string().min(1, 'Career vision is required.'),
  health: z.string().min(1, 'Health vision is required.'),
  relationships: z.string().min(1, 'Relationships vision is required.'),
  legacy: z.string().min(1, 'Legacy vision is required.'),
});

export const VisionFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  twoYearVision: VisionCategorySchema,
  fiveYearVision: VisionCategorySchema,
  tenYearVision: VisionCategorySchema,
});

export type VisionFormValues = z.infer<typeof VisionFormSchema>;
export type Roadmap = GenerateRoadmapFromVisionOutput;

// Firestore Document Types
export interface Vision {
  id: string;
  userId: string;
  title: string;
  createdAt: ReturnType<typeof serverTimestamp>;
  twoYearVision: z.infer<typeof VisionCategorySchema>;
  fiveYearVision: z.infer<typeof VisionCategorySchema>;
  tenYearVision: z.infer<typeof VisionCategorySchema>;
}

export interface UserData {
  id: string;
  email: string;
  planTierId: string;
}

export interface PlanTier {
  id: string;
  name: string;
  maxVisions: number;
  aiFeaturesEnabled: boolean;
  price: number;
  features: string[];
}
