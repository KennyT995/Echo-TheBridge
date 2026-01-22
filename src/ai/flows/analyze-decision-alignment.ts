'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeDecisionAlignmentInputSchema = z.object({
    decision: z.string().describe("The decision or opportunity the user is considering."),
    visions: z.array(z.string()).describe("List of the user's active visions and goals."),
});
export type AnalyzeDecisionAlignmentInput = z.infer<typeof AnalyzeDecisionAlignmentInputSchema>;

const AnalyzeDecisionAlignmentOutputSchema = z.object({
    score: z.number().describe("Alignment score from 1 to 10."),
    explanation: z.string().describe("Explanation of the score and potential trade-offs."),
    recommendation: z.string().describe("Actionable advice: Proceed, Reconsider, or Modify."),
});
export type AnalyzeDecisionAlignmentOutput = z.infer<typeof AnalyzeDecisionAlignmentOutputSchema>;

export async function analyzeDecisionAlignment(
    input: AnalyzeDecisionAlignmentInput
): Promise<AnalyzeDecisionAlignmentOutput> {
    return analyzeDecisionAlignmentFlow(input);
}

const analyzeDecisionAlignmentPrompt = ai.definePrompt({
    name: 'analyzeDecisionAlignmentPrompt',
    input: { schema: AnalyzeDecisionAlignmentInputSchema },
    output: { schema: AnalyzeDecisionAlignmentOutputSchema },
    prompt: `You are a strategic advisor helping the user make decisions that align with their long-term vision.
  
  User Visions:
  {{#each visions}}
  - {{this}}
  {{/each}}
  
  Proposed Decision/Action: "{{decision}}"
  
  Analyze if this decision moves them closer to or further from their visions.
  Provide an Alignment Score (1-10), where 10 is perfect alignment.
  Explain your reasoning, highlighting any conflicts or synergies.
  Give a clear recommendation.
  `,
});

const analyzeDecisionAlignmentFlow = ai.defineFlow(
    {
        name: 'analyzeDecisionAlignmentFlow',
        inputSchema: AnalyzeDecisionAlignmentInputSchema,
        outputSchema: AnalyzeDecisionAlignmentOutputSchema,
    },
    async input => {
        const { output } = await analyzeDecisionAlignmentPrompt(input);
        return output!;
    }
);
