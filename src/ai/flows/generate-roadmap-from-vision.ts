'use server';

/**
 * @fileOverview Generates a roadmap from a single, user-defined goal.
 *
 * - generateRoadmapFromVision - A function that generates a roadmap from the user's goal.
 * - GenerateRoadmapFromVisionInput - The input type for the generateRoadmapFromVision function.
 * - GenerateRoadmapFromVisionOutput - The return type for the generateRoadmapFromVision function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateRoadmapFromVisionInputSchema = z.object({
  title: z.string().optional().default(''),
  goal: z.string().describe("The user's primary goal or vision."),
});
export type GenerateRoadmapFromVisionInput = z.infer<typeof GenerateRoadmapFromVisionInputSchema>;

const RoadmapItemSchema = z.object({
  text: z.string().describe("The actionable text for the roadmap item."),
  completed: z.boolean().default(false).describe("Whether the item is completed. This should always be false by default."),
});

const RoadmapSchema = z.object({
  yearlyMilestones: z.array(RoadmapItemSchema).describe('Key achievements for the current year.'),
  monthlySprints: z.array(RoadmapItemSchema).describe('Focus for the next 12 months.'),
  weeklyTactics: z.array(RoadmapItemSchema).describe('Actions needed this week.'),
  dailyHabits: z.array(RoadmapItemSchema).describe('Atomic units of action required daily.'),
});

const GenerateRoadmapFromVisionOutputSchema = RoadmapSchema.describe('A structured roadmap with yearly milestones, monthly sprints, weekly tactics, and daily habits.');
export type GenerateRoadmapFromVisionOutput = z.infer<typeof GenerateRoadmapFromVisionOutputSchema>;

export async function generateRoadmapFromVision(input: GenerateRoadmapFromVisionInput): Promise<GenerateRoadmapFromVisionOutput> {
  return generateRoadmapFromVisionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRoadmapFromVisionPrompt',
  input: { schema: GenerateRoadmapFromVisionInputSchema },
  output: { schema: GenerateRoadmapFromVisionOutputSchema },
  prompt: `You are a world-class Strategy Architect and Chief Vision Officer, capable of reverse-engineering ambitious dreams into inevitable realities.
  
  The user has defined a vision titled: "{{{title}}}"
  The goal description is: "{{{goal}}}"
  
  Your task: Breakdown this vision into a "Physics of Progress" roadmap.
  1. Yearly Milestones: The "Big Rocks" that must move.
  2. Monthly Sprints: The 30-day missions to conquer specific territories.
  3. Weekly Tactics: The precise maneuvers to execute starting next Monday.
  4. Daily Habits: The atomic units of behavior that compound into the result.
  
  CRITICAL INSTRUCTIONS:
  - Be uncomfortably specific. Avoid generic filler like "Research market" or "Stay positive".
  - Instead of "Network", say "Send 5 DMs to industry leaders in [Niche]".
  - Instead of "Learn code", say "Build a Hello World app in Next.js".
  - Focus on High-Leverage Activities (80/20 rule).
  
  Return ONLY the raw JSON matching the schema.`,
});


const generateRoadmapFromVisionFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFromVisionFlow',
    inputSchema: GenerateRoadmapFromVisionInputSchema,
    outputSchema: GenerateRoadmapFromVisionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
