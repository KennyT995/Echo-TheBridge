import { ai } from "@/ai/genkit";
import { z } from "zod";

export const AnalyzeVisionIntentInputSchema = z.object({
  goal: z.string(),
});

export const VisionIntentSchema = z.object({
  title: z.string(),
  goal: z.string(),
  category: z.enum([
    "Career",
    "Health",
    "Financial",
    "Personal Growth",
    "Relationships",
    "Legacy",
  ]),
});

export const AnalyzeVisionIntentOutputSchema = z.object({
  isMultiVision: z.boolean(),
  reasoning: z.string(),
  proposedVisions: z.array(VisionIntentSchema),
  unifiedVision: VisionIntentSchema,
});

export type AnalyzeVisionIntentInput = z.infer<
  typeof AnalyzeVisionIntentInputSchema
>;
export type AnalyzeVisionIntentOutput = z.infer<
  typeof AnalyzeVisionIntentOutputSchema
>;

const prompt = ai.definePrompt({
  name: "analyzeVisionIntentPrompt",
  input: { schema: AnalyzeVisionIntentInputSchema },
  output: { schema: AnalyzeVisionIntentOutputSchema },
  prompt: `You are the Lead Vision Architect for Echo: The Bridge. Your function is to deconstruct user intent into structural strategic primitives.

Input Goal: "{{{goal}}}"

Operational Parameters:
1. Structural Analysis: Scan for divergent trajectories. If the goal contains unrelated vectors (e.g., "Scale a SaaS" AND "Run a Marathon"), split them.
2. Synthesis Logic: If vectors are synergistic (e.g., "Learn Next.js" to "Build a Platform"), unify them under a single architectural blueprint.
3. Category Allocation: Map to the optimal sector: 'Career', 'Health', 'Financial', 'Personal Growth', 'Relationships', 'Legacy'.
4. Naming Protocol: Generate high-fidelity, architectural titles (e.g., "Protocol: Cognitive Expansion" instead of "Learn to Read More").

Output Constraint: Return ONLY the valid JSON structure matching the schema.`,
});

export const analyzeVisionIntent = ai.defineFlow(
  {
    name: "analyzeVisionIntent",
    inputSchema: AnalyzeVisionIntentInputSchema,
    outputSchema: AnalyzeVisionIntentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Failed to analyze vision intent");
    }
    return output;
  },
);
