import { ai } from "@/ai/genkit";
import { z } from "zod";

export const GenerateDailyBriefingInputSchema = z.object({
  userName: z.string().optional(),
  activeVisionTitle: z.string().optional(),
  todaysHabits: z.array(z.string()).optional(),
  recentReflection: z.string().optional(),
});
export type GenerateDailyBriefingInput = z.infer<
  typeof GenerateDailyBriefingInputSchema
>;

export const GenerateDailyBriefingOutputSchema = z.object({
  quote: z.string(),
  focusConfig: z.object({
    focus: z.string(),
    motivation: z.string(),
  }),
});
export type GenerateDailyBriefingOutput = z.infer<
  typeof GenerateDailyBriefingOutputSchema
>;

export const generateDailyBriefing = ai.defineFlow(
  {
    name: "generateDailyBriefing",
    inputSchema: GenerateDailyBriefingInputSchema,
    outputSchema: GenerateDailyBriefingOutputSchema,
  },
  async (input) => {
    const { userName, activeVisionTitle, todaysHabits, recentReflection } =
      input;

    const prompt = `
      You are an elite life coach for ${userName || "a visionary"}.
      
      Context:
      - Their main vision is: "${activeVisionTitle || "To build a better future"}".
      - Today's habits: ${todaysHabits?.join(", ") || "General improvements"}.
      - Their last reflection: "${recentReflection || "No recent reflection"}".

      Generate a "Morning Briefing" JSON with:
      1. A short, punchy, inspirational quote (can be famous or original) relevant to their context.
      2. A specific "Focus" for the day (3-5 words).
      3. A short "Motivation" (1-2 sentences) connecting their habits to their vision, referencing their reflection if relevant.
    `;

    const response = await ai.generate({
      prompt: prompt,
      output: { schema: GenerateDailyBriefingOutputSchema },
    });

    if (!response.output) {
      throw new Error("Failed to generate briefing");
    }

    return response.output;
  },
);
