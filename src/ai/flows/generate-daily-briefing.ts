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
      You are the Echo AI Architect, an elite strategic advisor for ${userName || "a visionary strategist"}.
      
      Structural Context:
      - Primary Strategic Vision: "${activeVisionTitle || "Undefined Ambition"}".
      - Operational Habits: ${todaysHabits?.join(", ") || "Foundational maintenance"}.
      - Recent Neural Reflection: "${recentReflection || "No recent reflection data available"}".

      Objective: Synthesize a high-fidelity "Morning Briefing" that calibrates the user's focus for maximum trajectory alignment.

      Output Requirements (JSON):
      1. "quote": A singular, high-impact cognitive anchor. It should be punchy, profound, and relevant to their specific vision and recent reflection.
      2. "focus": A "Strategic Focus" for the immediate 24-hour cycle (3-5 words, active and commanding).
      3. "motivation": A sophisticated 1-2 sentence calibration. Connect their base operational habits to the high-level vision, framing today's actions as essential components of their bridge to the future. Use architectural metaphors if appropriate.
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
