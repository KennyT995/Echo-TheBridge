'use server';
/**
 * @fileOverview This flow analyzes user input (problems, concerns, wins) and provides a strategic briefing.
 *
 * - analyzeAndReflectOnUserInput - Analyzes user input and provides a strategic briefing.
 * - AnalyzeAndReflectOnUserInputInput - The input type for the analyzeAndReflectOnUserInput function.
 * - AnalyzeAndReflectOnUserInputOutput - The return type for the analyzeAndReflectOnUserInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAndReflectOnUserInputInputSchema = z.object({
  userInput: z
    .string()
    .describe("The user's input, which can be a problem, concern, or completed win."),
  vision: z
    .string()
    .describe("The user's overall vision and goals, to provide context for the analysis."),
});
export type AnalyzeAndReflectOnUserInputInput = z.infer<typeof AnalyzeAndReflectOnUserInputInputSchema>;

const AnalyzeAndReflectOnUserInputOutputSchema = z.object({
  strategicBriefing: z
    .string()
    .describe(
      'A strategic briefing providing suggestions, pivots, or affirmations based on the user input and vision.'
    ),
});
export type AnalyzeAndReflectOnUserInputOutput = z.infer<typeof AnalyzeAndReflectOnUserInputOutputSchema>;

export async function analyzeAndReflectOnUserInput(
  input: AnalyzeAndReflectOnUserInputInput
): Promise<AnalyzeAndReflectOnUserInputOutput> {
  return analyzeAndReflectOnUserInputFlow(input);
}

const analyzeAndReflectOnUserInputPrompt = ai.definePrompt({
  name: 'analyzeAndReflectOnUserInputPrompt',
  input: {schema: AnalyzeAndReflectOnUserInputInputSchema},
  output: {schema: AnalyzeAndReflectOnUserInputOutputSchema},
  prompt: `You are an AI coach helping the user stay on track towards their vision. The user will provide input in the form of problems, concerns or completed wins.

Vision: {{{vision}}}

Input: {{{userInput}}}

Analyze the input in the context of the user's vision. Provide a strategic briefing with suggestions, pivots, or affirmations to help the user stay on track. The briefing should be concise and actionable.

Strategic Briefing:`,
});

const analyzeAndReflectOnUserInputFlow = ai.defineFlow(
  {
    name: 'analyzeAndReflectOnUserInputFlow',
    inputSchema: AnalyzeAndReflectOnUserInputInputSchema,
    outputSchema: AnalyzeAndReflectOnUserInputOutputSchema,
  },
  async input => {
    const {output} = await analyzeAndReflectOnUserInputPrompt(input);
    return output!;
  }
);
