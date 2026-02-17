"use server";

import {
  generateRoadmapFromVision,
  GenerateRoadmapFromVisionOutput,
  GenerateRoadmapFromVisionInput,
} from "@/ai/flows/generate-roadmap-from-vision";
import {
  analyzeAndReflectOnUserInput,
  type AnalyzeAndReflectOnUserInputOutput,
} from "@/ai/flows/analyze-and-reflect-on-user-input";
import {
  generateVisionIdeas,
  type GenerateVisionIdeasOutput,
} from "@/ai/flows/generate-vision-ideas";
import { VisionFormSchema, type VisionFormValues } from "@/lib/types";
import { correctGrammarAndSpelling } from "@/ai/flows/correct-grammar-and-spelling";
import {
  analyzeVisionIntent,
  type AnalyzeVisionIntentOutput,
} from "@/ai/flows/analyze-vision-intent";
import {
  generateDailyBriefing,
  GenerateDailyBriefingInput,
  GenerateDailyBriefingOutput,
} from "@/ai/flows/generate-daily-briefing";
import {
  generateFutureSelfChat,
  GenerateFutureSelfChatInput,
  GenerateFutureSelfChatOutput,
} from "@/ai/flows/generate-future-self-chat";
import {
  analyzeDecisionAlignment,
  AnalyzeDecisionAlignmentInput,
  AnalyzeDecisionAlignmentOutput,
} from "@/ai/flows/analyze-decision-alignment";
import {
  generateFutureLetter,
  GenerateFutureLetterInput,
  GenerateFutureLetterOutput,
} from "@/ai/flows/generate-future-letter";
import { logger } from "@/lib/logger";

/**
 * Validates the vision intent using AI.
 */
export async function analyzeVision(
  goal: string,
): Promise<AnalyzeVisionIntentOutput | { error: string }> {
  try {
    const result = await analyzeVisionIntent({ goal });
    return result;
  } catch (error) {
    logger.error("[actions] Vision analysis failed:", error);
    return { error: "Transmission Interrupted: Unable to verify vision alignment." };
  }
}

/**
 * Generates a comprehensive roadmap based on a vision.
 */
export async function generateRoadmap(
  values: VisionFormValues & Partial<GenerateRoadmapFromVisionInput>,
): Promise<{
  roadmap?: GenerateRoadmapFromVisionOutput;
  correctedGoal?: string;
  error?: string;
}> {
  const validatedFields = VisionFormSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      error: "Protocol Error: Invalid fields. Please ensure your goal is descriptive enough.",
    };
  }

  try {
    // First, correct the grammar of the goal.
    const correctionResult = await correctGrammarAndSpelling({
      text: validatedFields.data.goal,
    });
    const correctedGoal = correctionResult.correctedText;

    const isPartialRegen =
      !!values.sectionToRegenerate && values.sectionToRegenerate !== "all";

    // Then, generate the roadmap with the corrected goal.
    const roadmap = await generateRoadmapFromVision({
      title: validatedFields.data.title,
      goal: correctedGoal,
      timelineFocus: values.timelineFocus,
      yearlyFocus: values.yearlyFocus,
      monthlyFocus: values.monthlyFocus,
      weeklyFocus: values.weeklyFocus,
      dailyFocus: values.dailyFocus,
      completedTasks: values.completedTasks,
      sectionToRegenerate: values.sectionToRegenerate,
      isPartialRegen: isPartialRegen,
    });
    return { roadmap, correctedGoal };
  } catch (error: unknown) {
    logger.error("[actions] Error in generateRoadmap:", error);
    let errorMessage = "";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Check for AI flow related errors
    if (
      errorMessage.includes("AI") ||
      errorMessage.includes("flow") ||
      errorMessage.includes("genkit")
    ) {
      return {
        error:
          "Neural Sync Failure: An unexpected error occurred while generating your roadmap. Calibration required.",
      };
    }
    // Generic fallback error
    return {
      error:
        "System Error: Roadmap architecture failed. Please try again.",
    };
  }
}

/**
 * Gets a strategic reflection on user input relative to their vision.
 */
export async function getReflection(
  userInput: string,
  vision: string,
): Promise<{ strategicBriefing?: string; error?: string }> {
  try {
    const result: AnalyzeAndReflectOnUserInputOutput =
      await analyzeAndReflectOnUserInput({ userInput, vision });
    return { strategicBriefing: result.strategicBriefing };
  } catch (error) {
    logger.error("[actions] Reflection generation failed:", error);
    return {
      error:
        "Reflection Protocol failed. Unable to synthesize strategic briefing.",
    };
  }
}

/**
 * Generates vision ideas based on keywords.
 */
export async function getVisionIdeas(
  keywords: string,
): Promise<{ ideas?: string[]; error?: string }> {
  if (!keywords) {
    return { error: "Input Error: Please provide at least one keyword." };
  }
  try {
    const result: GenerateVisionIdeasOutput = await generateVisionIdeas({
      keywords,
    });
    return { ideas: result.ideas };
  } catch (error) {
    logger.error("[actions] Vision idea generation failed:", error);
    return {
      error:
        "Ideation Module encountered an error. Please re-initialize.",
    };
  }
}



/**
 * Generates a daily briefing for the user.
 */
export async function getDailyBriefing(
  input: GenerateDailyBriefingInput,
): Promise<{ briefing?: GenerateDailyBriefingOutput; error?: string }> {
  try {
    const briefing = await generateDailyBriefing(input);
    return { briefing };
  } catch (error) {
    logger.error("[actions] Daily briefing generation failed:", error);
    return { error: "Briefing Signal Lost: Failed to generate daily briefing." };
  }
}

/**
 * Connects the user with their future self in a chat.
 */
export async function getFutureSelfChat(
  input: GenerateFutureSelfChatInput,
): Promise<{ response?: GenerateFutureSelfChatOutput; error?: string }> {
  try {
    const chatResponse = await generateFutureSelfChat(input);
    return { response: chatResponse };
  } catch (error) {
    logger.error("[actions] Future self chat failed:", error);
    return { error: "Temporal Link Unstable: Failed to connect to Future Self." };
  }
}

/**
 * Checks the alignment of a decision with the user's visions.
 */
export async function checkDecisionAlignment(
  input: AnalyzeDecisionAlignmentInput,
): Promise<{ result?: AnalyzeDecisionAlignmentOutput; error?: string }> {
  try {
    const result = await analyzeDecisionAlignment(input);
    return { result };
  } catch (error) {
    logger.error("[actions] Decision alignment check failed:", error);
    return { error: "Alignment Check Failed: Unable to analyze decision parameters." };
  }
}

/**
 * Generates a letter from the future.
 */
export async function checkFutureLetter(
  input: GenerateFutureLetterInput,
): Promise<{ result?: GenerateFutureLetterOutput; error?: string }> {
  try {
    const result = await generateFutureLetter(input);
    return { result };
  } catch (error) {
    logger.error("[actions] Future letter generation failed:", error);
    return { error: "Transmission Blocked: Failed to receive letter from the future." };
  }
}

