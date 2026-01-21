'use server';

/**
 * @fileOverview Generates a roadmap from a single, user-defined goal.
 *
 * - generateRoadmapFromVision - A function that generates a roadmap from the user's goal.
 * - GenerateRoadmapFromVisionInput - The input type for the generateRoadmapFromVision function.
 * - GenerateRoadmapFromVisionOutput - The return type for the generateRoadmapFromVision function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateRoadmapFromVisionInputSchema = z.object({
  title: z.string().optional().default(''),
  goal: z.string().describe("The user's primary goal or vision."),
  timelineFocus: z.string().optional().describe("User's specific focus for the overall vision timeline."),
  yearlyFocus: z.string().optional().describe("User's specific focus for yearly milestones."),
  monthlyFocus: z.string().optional().describe("User's specific focus for monthly sprints."),
  weeklyFocus: z.string().optional().describe("User's specific focus for weekly tactics."),
  dailyFocus: z.string().optional().describe("User's specific focus for daily habits."),
  completedTasks: z.array(z.string()).optional().describe("A list of tasks the user has already completed."),
});
export type GenerateRoadmapFromVisionInput = z.infer<typeof GenerateRoadmapFromVisionInputSchema>;

const RoadmapItemSchema = z.object({
  text: z.string().describe("The actionable text for the roadmap item."),
  completed: z.boolean().default(false).describe("Whether the item is completed. This should always be false by default."),
});

const RoadmapSchema = z.object({
  visionTimeline: z.array(RoadmapItemSchema).describe('The chronological phases of the entire journey. (e.g. Phase 1, Phase 2).'),
  yearlyMilestones: z.array(RoadmapItemSchema).describe('Key achievements to hit this year.'),
  monthlySprints: z.array(RoadmapItemSchema).describe('Recurring monthly focus areas or themes.'),
  weeklyTactics: z.array(RoadmapItemSchema).describe('Standard weekly routine or key actions to take every week.'),
  dailyHabits: z.array(RoadmapItemSchema).describe('Atomic units of action required daily.'),
});

const GenerateRoadmapFromVisionOutputSchema = RoadmapSchema.describe('A structured roadmap with vision timeline, yearly milestones, monthly sprints, weekly tactics, and daily habits.');
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

{{#if completedTasks}}
The user has already completed the following tasks. Do not suggest these again. Instead, build upon these accomplishments to define the next steps.
Completed Tasks:
{{#each completedTasks}}
- {{{this}}}
{{/each}}
{{/if}}

The user may have provided specific focus areas to guide generation. If a focus area is provided for a section, prioritize it. Otherwise, generate the best items based on the overall goal and timeframe.
{{#if timelineFocus}}
Timeline Focus: {{{timelineFocus}}}
{{/if}}
{{#if yearlyFocus}}
Yearly Focus: {{{yearlyFocus}}}
{{/if}}
{{#if monthlyFocus}}
Monthly Focus: {{{monthlyFocus}}}
{{/if}}
{{#if weeklyFocus}}
Weekly Focus: {{{weeklyFocus}}}
{{/if}}
{{#if dailyFocus}}
Daily Focus: {{{dailyFocus}}}
{{/if}}

Generate the roadmap with these sections. DO NOT generate sequential lists like "Week 1", "Week 2" or "Month 1", "Month 2". Instead, generate the RECURRING or FOCUS-BASED actions for that timeframe.

1. Vision Timeline: The chronological phases of the entire journey (e.g. Phase 1: Foundation, Phase 2: Growth).
2. Yearly Milestones: Key achievements to hit within the year.
3. Monthly Sprints: The recurring monthly themes or focus areas.
4. Weekly Tactics: The standard weekly routine or key actions to take every week.
5. Daily Habits: The atomic units of behavior to do every single day.

CRITICAL INSTRUCTIONS:
- Be uncomfortably specific. Avoid generic filler.
- For Weekly and Daily items, focus on RECURRING ROUTINES, not a schedule.
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
