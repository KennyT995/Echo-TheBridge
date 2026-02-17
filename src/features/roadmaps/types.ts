import { z } from "zod";

export type RoadmapSectionKey =
  | "visionTimeline"
  | "yearlyMilestones"
  | "monthlySprints"
  | "weeklyTactics"
  | "dailyHabits";

// New structure for a single roadmap item
export const RoadmapItemSchema = z.object({
  text: z.string(),
  completed: z.boolean(),
});
export type RoadmapItem = z.infer<typeof RoadmapItemSchema>;

// Schema for archived/completed items
export const RoadmapHistoryItemSchema = z.object({
  text: z.string(),
  completedAt: z.custom<unknown>(
    (val) =>
      val &&
      (typeof (val as Record<string, unknown>).toDate === "function" ||
        val instanceof Date),
  ), // Validate Timestamp or Date
  section: z.enum([
    "visionTimeline",
    "yearlyMilestones",
    "monthlySprints",
    "weeklyTactics",
    "dailyHabits",
  ]),
});
export type RoadmapHistoryItem = z.infer<typeof RoadmapHistoryItemSchema>;

// Updated Roadmap schema
export const RoadmapSchema = z.object({
  visionTimeline: z.array(RoadmapItemSchema).default([]),
  yearlyMilestones: z.array(RoadmapItemSchema).default([]),
  monthlySprints: z.array(RoadmapItemSchema).default([]),
  weeklyTactics: z.array(RoadmapItemSchema).default([]),
  dailyHabits: z.array(RoadmapItemSchema).default([]),
  history: z.array(RoadmapHistoryItemSchema).optional().default([]),
});
export type Roadmap = z.infer<typeof RoadmapSchema> & {
  id: string;
  visionId: string;
  userId: string;
};
