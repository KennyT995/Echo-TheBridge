"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateFutureLetterInputSchema = z.object({
  userName: z.string().describe("The user's first name."),
  visions: z.array(z.string()).describe("The user's active visions and goals."),
  recentLogs: z
    .array(z.string())
    .optional()
    .describe("Summaries of recent daily logs or streak status."),
  streakCount: z.number().optional().describe("Current daily streak count."),
});

export type GenerateFutureLetterInput = z.infer<
  typeof GenerateFutureLetterInputSchema
>;

const GenerateFutureLetterOutputSchema = z.object({
  subject: z.string().describe("The email subject line."),
  body: z
    .string()
    .describe("The content of the letter written by the Future Self."),
  tone: z
    .enum(["encouraging", "urgent", "celebratory"])
    .describe("The emotional tone of the letter."),
});

export type GenerateFutureLetterOutput = z.infer<
  typeof GenerateFutureLetterOutputSchema
>;

export async function generateFutureLetter(
  input: GenerateFutureLetterInput,
): Promise<GenerateFutureLetterOutput> {
  return generateFutureLetterFlow(input);
}

const generateFutureLetterPrompt = ai.definePrompt({
  name: "generateFutureLetterPrompt",
  input: { schema: GenerateFutureLetterInputSchema },
  output: { schema: GenerateFutureLetterOutputSchema },
  prompt: `You are the user's "Future Self" from 5 years in the future. You have achieved the Visions they are currently working towards.
  
  User: {{userName}}
  VISIONS:
  {{#each visions}}- {{this}}{{/each}}
  
  CONTEXT:
  Streak: {{streakCount}} days.
  Recent Activity:
  {{#each recentLogs}}- {{this}}{{/each}}
  
  Write a personal, emotional letter to your past self (the user).
  - If streak is high, celebrate the momentum. 
  - If streak is broken or low, offer grace and urgency. "I'm still here waiting for you."
  - Reference specific visions as things "we" have now accomplished.
  - Keep it under 200 words.
  `,
});

const generateFutureLetterFlow = ai.defineFlow(
  {
    name: "generateFutureLetterFlow",
    inputSchema: GenerateFutureLetterInputSchema,
    outputSchema: GenerateFutureLetterOutputSchema,
  },
  async (input) => {
    const { output } = await generateFutureLetterPrompt(input);
    return output!;
  },
);
