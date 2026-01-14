import { z } from 'zod';
import { serverTimestamp } from 'firebase/firestore';

export const VisionFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  goal: z.string().min(10, 'Your goal should be at least 10 characters long to provide enough context for the AI.'),
});

export type VisionFormValues = z.infer<typeof VisionFormSchema>;

// New structure for a single roadmap item
export const RoadmapItemSchema = z.object({
  text: z.string(),
  completed: z.boolean(),
});
export type RoadmapItem = z.infer<typeof RoadmapItemSchema>;

// Updated Roadmap schema
export const RoadmapSchema = z.object({
  yearlyMilestones: z.array(RoadmapItemSchema),
  monthlySprints: z.array(RoadmapItemSchema),
  weeklyTactics: z.array(RoadmapItemSchema),
  dailyHabits: z.array(RoadmapItemSchema),
});
export type Roadmap = z.infer<typeof RoadmapSchema> & {
    id: string;
    visionId: string;
    userId: string;
};


// Firestore Document Types
export interface Vision {
  id: string;
  userId: string;
  title: string;
  goal: string;
  createdAt: ReturnType<typeof serverTimestamp>;
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
