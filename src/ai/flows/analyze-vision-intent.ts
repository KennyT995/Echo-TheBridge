import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const AnalyzeVisionIntentInputSchema = z.object({
    goal: z.string(),
});

export const VisionIntentSchema = z.object({
    title: z.string(),
    goal: z.string(),
    category: z.enum(['Career', 'Health', 'Financial', 'Personal Growth', 'Relationships', 'Legacy']),
});

export const AnalyzeVisionIntentOutputSchema = z.object({
    isMultiVision: z.boolean(),
    reasoning: z.string(),
    proposedVisions: z.array(VisionIntentSchema),
    unifiedVision: VisionIntentSchema,
});

export type AnalyzeVisionIntentInput = z.infer<typeof AnalyzeVisionIntentInputSchema>;
export type AnalyzeVisionIntentOutput = z.infer<typeof AnalyzeVisionIntentOutputSchema>;

const prompt = ai.definePrompt({
    name: 'analyzeVisionIntentPrompt',
    input: { schema: AnalyzeVisionIntentInputSchema },
    output: { schema: AnalyzeVisionIntentOutputSchema },
    prompt: `Analyze the following user goal for a "Vision Board" application.
      
      User Goal: "{{{goal}}}"

      Your task is to determine if this goal contains multiple, distinct, unrelated visions that would be better served by separate roadmaps (e.g., "Start a business" AND "Run a marathon").
      
      If the goals are related parts of a larger whole (e.g., "Get a promotion" AND "Learn to code for the promotion"), treat them as a single unified vision.

      Output a JSON object with the following structure:
      - isMultiVision: true if multiple unrelated visions are detected, false otherwise.
      - reasoning: A brief explanation of why you think these should be separate or unified.
      - proposedVisions: An array of 2 or more distinct visions if isMultiVision is true. If false, this can be empty or contain the single vision.
      - unifiedVision: A fallback single vision that combines everything, even if unrelated (in case the user wants to keep them together).
      
      43. For each vision (proposed or unified):
      44. Inferred the most appropriate Category from: 'Career', 'Health', 'Financial', 'Personal Growth', 'Relationships', 'Legacy'.
      45. Propose a concise, inspiring Title.`,
});

export const analyzeVisionIntent = ai.defineFlow(
    {
        name: 'analyzeVisionIntent',
        inputSchema: AnalyzeVisionIntentInputSchema,
        outputSchema: AnalyzeVisionIntentOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (!output) {
            throw new Error('Failed to analyze vision intent');
        }
        return output;
    }
);
