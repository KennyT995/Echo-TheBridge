"use server";
/**
 * @fileOverview A flow to correct grammar and spelling in a given text.
 *
 * - correctGrammarAndSpelling - A function that takes text and returns the corrected version.
 * - CorrectGrammarAndSpellingInput - The input type for the function.
 * - CorrectGrammarAndSpellingOutput - The return type for the function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const CorrectGrammarAndSpellingInputSchema = z.object({
  text: z.string().describe("The text to be corrected."),
});
export type CorrectGrammarAndSpellingInput = z.infer<
  typeof CorrectGrammarAndSpellingInputSchema
>;

const CorrectGrammarAndSpellingOutputSchema = z.object({
  correctedText: z.string().describe("The corrected version of the text."),
});
export type CorrectGrammarAndSpellingOutput = z.infer<
  typeof CorrectGrammarAndSpellingOutputSchema
>;

export async function correctGrammarAndSpelling(
  input: CorrectGrammarAndSpellingInput,
): Promise<CorrectGrammarAndSpellingOutput> {
  return correctGrammarAndSpellingFlow(input);
}

const prompt = ai.definePrompt({
  name: "correctGrammarAndSpellingPrompt",
  input: { schema: CorrectGrammarAndSpellingInputSchema },
  output: { schema: CorrectGrammarAndSpellingOutputSchema },
  prompt: `You are the Lead Linguistic Architect for Echo: The Bridge. Your mission is to calibrate and refine the user's transmission for maximal clarity and impact.

Objective: Correct all grammatical entropy and spelling deviations in the provided text.
Constraint: Maintain the original intent and psychological resonance. Do not alter the visionary tone.

Transmission to process:
"{{{text}}}"

Return ONLY the raw JSON matching the schema.`,
});

const correctGrammarAndSpellingFlow = ai.defineFlow(
  {
    name: "correctGrammarAndSpellingFlow",
    inputSchema: CorrectGrammarAndSpellingInputSchema,
    outputSchema: CorrectGrammarAndSpellingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
