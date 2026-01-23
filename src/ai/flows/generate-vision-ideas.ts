"use server";
/**
 * @fileOverview Generates inspiring vision statements based on user-provided keywords.
 *
 * - generateVisionIdeas - A function that generates vision ideas from keywords.
 * - GenerateVisionIdeasInput - The input type for the generateVisionIdeas function.
 * - GenerateVisionIdeasOutput - The return type for the generateVisionIdeas function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateVisionIdeasInputSchema = z.object({
  keywords: z
    .string()
    .describe("A comma-separated list of keywords from the user."),
});
export type GenerateVisionIdeasInput = z.infer<
  typeof GenerateVisionIdeasInputSchema
>;

const GenerateVisionIdeasOutputSchema = z.object({
  ideas: z
    .array(z.string())
    .describe("An array of three generated vision statements."),
});
export type GenerateVisionIdeasOutput = z.infer<
  typeof GenerateVisionIdeasOutputSchema
>;

export async function generateVisionIdeas(
  input: GenerateVisionIdeasInput,
): Promise<GenerateVisionIdeasOutput> {
  return generateVisionIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: "generateVisionIdeasPrompt",
  input: { schema: GenerateVisionIdeasInputSchema },
  output: { schema: GenerateVisionIdeasOutputSchema },
  prompt: `You are an expert creative strategist and life coach. Your task is to generate three distinct and inspiring vision statements based on the user's keywords.

Keywords: {{{keywords}}}

The statements should be ambitious yet achievable, and phrased as a clear goal.

Example:
Keywords: art, community, teaching
Output: ["Launch a thriving local art studio that offers free workshops for underprivileged youth.", "Create an online platform that connects emerging artists with mentors and patrons.", "Publish a book that teaches complex artistic techniques in a simple, accessible way."]

Generate three ideas now.`,
});

const generateVisionIdeasFlow = ai.defineFlow(
  {
    name: "generateVisionIdeasFlow",
    inputSchema: GenerateVisionIdeasInputSchema,
    outputSchema: GenerateVisionIdeasOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
