'use server';

/**
 * @fileOverview Generates a roadmap from user-defined visions for 2, 5, and 10-year horizons.
 *
 * - generateRoadmapFromVision - A function that generates a roadmap from the user's vision.
 * - GenerateRoadmapFromVisionInput - The input type for the generateRoadmapFromVision function.
 * - GenerateRoadmapFromVisionOutput - The return type for the generateRoadmapFromVision function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisionSchema = z.object({
  career: z.string().describe('Vision for career in the specified horizon.'),
  health: z.string().describe('Vision for health in the specified horizon.'),
  relationships: z.string().describe('Vision for relationships in the specified horizon.'),
  legacy: z.string().describe('Vision for legacy in the specified horizon.'),
});

const GenerateRoadmapFromVisionInputSchema = z.object({
  twoYearVision: VisionSchema.describe('Vision for 2-year horizon.'),
  fiveYearVision: VisionSchema.describe('Vision for 5-year horizon.'),
  tenYearVision: VisionSchema.describe('Vision for 10-year horizon.'),
});
export type GenerateRoadmapFromVisionInput = z.infer<typeof GenerateRoadmapFromVisionInputSchema>;

const RoadmapSchema = z.object({
  yearlyMilestones: z.array(z.string()).describe('Key achievements for the current year.'),
  monthlySprints: z.array(z.string()).describe('Focus for the next 12 months.'),
  weeklyTactics: z.array(z.string()).describe('Actions needed this week.'),
  dailyHabits: z.array(z.string()).describe('Atomic units of action required daily.'),
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
  prompt: `You are an expert life coach specializing in reverse-engineering long-term visions into actionable roadmaps.

  Based on the user's 2-year, 5-year, and 10-year visions, create a structured roadmap that bridges the gap between their long-term goals and daily actions.

  Consider how each element builds towards the longer-term vision.  Ensure that the weekly tactics and daily habits contribute directly to the monthly sprints and yearly milestones.

  Here are the user's visions:
  - 2-Year Vision: Career: {{{twoYearVision.career}}}, Health: {{{twoYearVision.health}}}, Relationships: {{{twoYearVision.relationships}}}, Legacy: {{{twoYearVision.legacy}}}
  - 5-Year Vision: Career: {{{fiveYearVision.career}}}, Health: {{{fiveYearVision.health}}}, Relationships: {{{fiveYearVision.relationships}}}, Legacy: {{{fiveYearVision.legacy}}}
  - 10-Year Vision: Career: {{{tenYearVision.career}}}, Health: {{{tenYearVision.health}}}, Relationships: {{{tenYearVision.relationships}}}, Legacy: {{{tenYearVision.legacy}}}
  
  Please provide the output in a valid JSON format that adheres to the specified output schema.
  `,
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
