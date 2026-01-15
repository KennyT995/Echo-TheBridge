'use server';
/**
 * @fileOverview A flow to correct grammar and spelling in a given text.
 *
 * - correctGrammarAndSpelling - A function that takes text and returns the corrected version.
 * - CorrectGrammarAndSpellingInput - The input type for the function.
 * - CorrectGrammarAndSpellingOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CorrectGrammarAndSpellingInputSchema = z.object({
  text: z.string().describe('The text to be corrected.'),
});
export type CorrectGrammarAndSpellingInput = z.infer<typeof CorrectGrammarAndSpellingInputSchema>;

const CorrectGrammarAndSpellingOutputSchema = z.object({
  correctedText: z.string().describe('The corrected version of the text.'),
});
export type CorrectGrammarAndSpellingOutput = z.infer<typeof CorrectGrammarAndSpellingOutputSchema>;

export async function correctGrammarAndSpelling(
  input: CorrectGrammarAndSpellingInput
): Promise<CorrectGrammarAndSpellingOutput> {
  return correctGrammarAndSpellingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctGrammarAndSpellingPrompt',
  input: { schema: CorrectGrammarAndSpellingInputSchema },
  output: { schema: CorrectGrammarAndSpellingOutputSchema },
  prompt: `You are an expert editor. Your sole task is to correct the grammar and spelling of the following text. Do not change the meaning or tone. Only fix objective errors.

Text to correct:
"{{{text}}}"

Return only the corrected text in the specified JSON format.`,
});

const correctGrammarAndSpellingFlow = ai.defineFlow(
  {
    name: 'correctGrammarAndSpellingFlow',
    inputSchema: CorrectGrammarAndSpellingInputSchema,
    outputSchema: CorrectGrammarAndSpellingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
