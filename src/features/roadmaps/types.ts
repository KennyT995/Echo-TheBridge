import { z } from 'zod';

export type RoadmapSectionKey = 'yearlyMilestones' | 'monthlySprints' | 'weeklyTactics' | 'dailyHabits';

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
