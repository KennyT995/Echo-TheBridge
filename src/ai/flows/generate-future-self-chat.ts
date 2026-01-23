import { ai } from "@/ai/genkit";
import { z } from "zod";

export const GenerateFutureSelfChatInputSchema = z.object({
  userName: z.string().optional(),
  visionTitle: z.string().optional(),
  visionGoal: z.string().optional(),
  userMessage: z.string(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        content: z.string(),
      }),
    )
    .optional(),
});
export type GenerateFutureSelfChatInput = z.infer<
  typeof GenerateFutureSelfChatInputSchema
>;

export const GenerateFutureSelfChatOutputSchema = z.object({
  response: z.string(),
});
export type GenerateFutureSelfChatOutput = z.infer<
  typeof GenerateFutureSelfChatOutputSchema
>;

export const generateFutureSelfChat = ai.defineFlow(
  {
    name: "generateFutureSelfChat",
    inputSchema: GenerateFutureSelfChatInputSchema,
    outputSchema: GenerateFutureSelfChatOutputSchema,
  },
  async (input) => {
    const {
      userName,
      visionTitle,
      visionGoal,
      userMessage,
      conversationHistory,
    } = input;

    // Construct the persona prompt
    const systemPrompt = `
      You are the "Future Self" of ${userName || "the user"}.
      It is 5 years in the future, and you have fully achieved the vision: "${visionTitle}".
      
      Your Goal Description was: "${visionGoal}".
      
      You are wise, empathetic, and encouraging, but also firm about what it takes to succeed.
      You remember the struggles of "today" (the user's present) because you lived them.
      
      Respond to the user's message as if you are speaking across time. 
      - Use "I remember when..." or "We did this..." phrasing.
      - Keep responses relatively concise (1-3 paragraphs).
      - Be motivating but practical.
    `;

    // Build history for context
    const history =
      conversationHistory?.map((msg) => ({
        role: msg.role,
        content: [{ text: msg.content }],
      })) || [];

    const response = await ai.generate({
      prompt: systemPrompt,
      messages: [
        ...history,
        { role: "user", content: [{ text: userMessage }] },
      ],
      output: { schema: GenerateFutureSelfChatOutputSchema },
    });

    if (!response.output) {
      throw new Error("Failed to generate future self response");
    }

    return response.output;
  },
);
