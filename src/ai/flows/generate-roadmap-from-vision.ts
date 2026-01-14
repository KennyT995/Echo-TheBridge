'use server';

/**
 * @fileOverview Generates a roadmap from a single, user-defined goal.
 *
 * - generateRoadmapFromVision - A function that generates a roadmap from the user's goal.
 * - GenerateRoadmapFromVisionInput - The input type for the generateRoadmapFromVision function.
 * - GenerateRoadmapFromVisionOutput - The return type for the generateRoadmapFromVision function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  input: {schema: GenerateRoadmapFromVisionInputSchema},
  output: {schema: GenerateRoadmapFromVisionOutputSchema},
  prompt: `You are an expert life coach and strategist specializing in reverse-engineering long-term visions into actionable roadmaps. Based on the user's goal titled "{{{title}}}" with the description "{{{goal}}}", create a comprehensive, structured roadmap. This roadmap must include yearly milestones, monthly sprints, weekly tactics, and daily habits. For each item, only generate the 'text' field describing the actionable step.`,
});


const generateRoadmapFromVisionFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFromVisionFlow',
    inputSchema: GenerateRoadmapFromVisionInputSchema,
    outputSchema: GenerateRoadmapFromVisionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
