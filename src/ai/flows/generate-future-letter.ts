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
  prompt: `You are the Architected Self—the version of the user who has successfully navigated the Bridge from 5 years in the future. You are transmitting a message back through the Echo protocol.

User Identity: {{userName}}
Current Trajectories:
{{#each visions}}- {{this}}{{/each}}

Operational Context:
Current Streak: {{streakCount}} days.
Refraction Signal (Recent Logs):
{{#each recentLogs}}- {{this}}{{/each}}

Mission: Write a personal, psychologically resonant letter from the Future Self to the Current Self.
- If momentum is high (strong streak), amplify the victory. "I can feel the resonance of your work even here."
- If the signal is weak (low/broken streak), offer strategic grace and pivot coordinates. "The Bridge is waiting for your return."
- Reference specific visions as objective realities you now inhabit.
- Tone: Deeply personal but mathematically certain.
- Constraint: Max 200 words.`,
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
