"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Zap, Sparkles } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { nanoid } from "nanoid";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { generateRoadmap, analyzeVision } from "@/app/actions";
import {
  VisionFormSchema,
  type VisionFormValues,
  visionCategories,
  type VisionCategory,
} from "@/lib/types";
import { VisionConfirmationDialog } from "./vision-confirmation-dialog";
import { VisionInspiration } from "./vision-inspiration";

import { useToast } from "@/hooks/use-toast";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { FirestorePaths } from "@/lib/firestore-paths";
import { logger } from "@/lib/logger";

interface VisionFormProps {
  onVisionCreated: (visionId: string) => void;
}



interface VisionAnalysis {
  isMultiVision: boolean;
  reasoning: string;
  unifiedVision: {
    title: string;
    goal: string;
    category: VisionCategory;
    reasoning?: string;
  };
  proposedVisions: Array<{
    title: string;
    goal: string;
    category: VisionCategory;
    reasoning?: string;
  }>;
}

export function VisionForm({ onVisionCreated }: VisionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<VisionFormValues>({
    resolver: zodResolver(VisionFormSchema),
    defaultValues: {
      title: "",
      goal: "",
      isPublic: false,
    },
  });

  const [analysis, setAnalysis] = useState<VisionAnalysis | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Helper to actually create a vision
  const createVision = async (data: VisionFormValues) => {
    if (!user) return;
    setIsLoading(true);
    // Ensure category is set (fallback for manual 'keep together')
    const finalData = { ...data };
    if (!finalData.category) {
      // This should be theoretically populated by AI, but as a fallback
      finalData.category = "Personal Growth";
    }

    const result = await generateRoadmap(finalData);

    if (result.error || !result.roadmap || !result.correctedGoal) {
      toast({
        variant: "destructive",
        title: "Error Generating Roadmap",
        description: result.error || "An unknown error occurred.",
      });
      setIsLoading(false);
      return;
    }

    const visionId = nanoid();

    const visionData = {
      ...finalData,
      goal: result.correctedGoal,
      id: visionId,
      userId: user.uid,
      createdAt: serverTimestamp(),
    };

    const roadmapData = {
      ...result.roadmap,
      id: visionId,
      visionId: visionId,
      userId: user.uid,
    };

    const visionRef = doc(firestore, FirestorePaths.vision(user.uid, visionId));
    setDocumentNonBlocking(visionRef, visionData, {});

    const roadmapRef = doc(firestore, FirestorePaths.roadmap(user.uid, visionId));
    setDocumentNonBlocking(roadmapRef, roadmapData, {});

    toast({
      title: "Vision Created",
      description: `"${finalData.title}" is ready.`,
    });

    return visionId;
  };

  async function onSubmit(values: VisionFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "You must be logged in to create a vision.",
      });
      return;
    }
    setIsLoading(true);

    // Step 1: Analyze Intent
    const analysisResult = await analyzeVision(values.goal);

    if ("error" in analysisResult) {
      // Fallback to normal flow if analysis fails
      logger.error("[VisionForm] Vision analysis failed:", analysisResult.error);
      const vid = await createVision(values);
      if (vid) {
        onVisionCreated(vid);
      }
      setIsLoading(false);
      return;
    }

    setAnalysis(analysisResult as VisionAnalysis);
    if (analysisResult.isMultiVision) {
      setIsLoading(false);
      setIsConfirmOpen(true);
      return; // Stop here and wait for dialog
    }

    // Auto-inject inferred category if missing
    if (!values.category && analysisResult.unifiedVision.category) {
      // We need to match the enum
      const category = analysisResult.unifiedVision
        .category as VisionCategory;
      form.setValue("category", category);
      values.category = category;
    }
    // Auto-inject title if missing
    if (!values.title && analysisResult.unifiedVision.title) {
      form.setValue("title", analysisResult.unifiedVision.title);
      values.title = analysisResult.unifiedVision.title;
    }

    // Proceed to creation (Unified or Single Normal)
    const vid = await createVision(values);
    if (vid) onVisionCreated(vid);
    setIsLoading(false);
  }

  const handleConfirmUnified = async () => {
    setIsConfirmOpen(false);
    setIsLoading(true);
    if (analysis?.unifiedVision) {
      form.setValue("title", analysis.unifiedVision.title);
      form.setValue("category", analysis.unifiedVision.category);
      const values = form.getValues(); // Get the updated values
      const vid = await createVision(values);
      if (vid) onVisionCreated(vid);
    }
    setIsLoading(false);
  };

  const handleConfirmSeparate = async () => {
    setIsConfirmOpen(false);
    setIsLoading(true);

    if (analysis?.proposedVisions) {
      for (const vision of analysis.proposedVisions) {
        await createVision({
          title: vision.title,
          goal: vision.goal,
          category: vision.category,
          isPublic: false,
        });
      }
      toast({
        title: "Multiple Visions Created",
        description: "We've created separate roadmaps for your goals.",
      });
      onVisionCreated("dashboard");
    }
    setIsLoading(false);
  };

  if (isConfirmOpen && analysis) {
    return (
      <VisionConfirmationDialog
        analysis={analysis}
        onConfirmUnified={handleConfirmUnified}
        onConfirmSeparate={handleConfirmSeparate}
        isCreating={isLoading}
        onCancel={() => setIsConfirmOpen(false)}
      />
    );
  }

  return (
    <div className="space-y-12 animate-reveal">
      <VisionInspiration onSelectIdea={(idea) => form.setValue("goal", idea)} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-xl font-bold tracking-tight">Vision Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Executive Physical Transformation"
                      className="h-14 rounded-2xl glass border-white/10 text-lg px-6 focus-visible:ring-primary/40 bg-white/5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-xl font-bold tracking-tight">Strategy Domain</FormLabel>
                  <RadioGroup
                    onValueChange={(val) => {
                      if (val === "auto") {
                        field.onChange(""); // Clear value for auto-detect
                      } else {
                        field.onChange(val);
                      }
                    }}
                    defaultValue={field.value || "auto"}
                    className="grid grid-cols-2 gap-4"
                  >
                    {/* Explicit "Let AI Pick" Option */}
                    <div className="col-span-2">
                      <RadioGroupItem
                        value="auto"
                        id="auto-pick"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="auto-pick"
                        className="flex flex-col items-center justify-center rounded-2xl border-2 border-white/5 bg-white/5 p-6 hover:bg-white/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer text-center h-full transition-all group"
                      >
                        <span className="font-bold text-xl flex items-center gap-3 group-hover:scale-105 transition-transform">
                          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                          Calibrate Automatically
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mt-2 font-bold">Recommended for complex ambitions</span>
                      </Label>
                    </div>

                    {visionCategories.map((category) => (
                      <div key={category}>
                        <RadioGroupItem
                          value={category}
                          id={category}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={category}
                          className="flex flex-col items-center justify-center rounded-2xl border-2 border-white/5 bg-white/5 p-4 hover:bg-white/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer text-center h-full transition-all"
                        >
                          <span className="font-bold text-base tracking-tight">{category}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-xl font-bold tracking-tight">The Vision Statement</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Articulate your vision with absolute clarity. Describe the 'What', 'How', and most importantly, the 'When'. (e.g., 'By Q4, I will have scaled my practice to 20 active clients while maintaining a 4-day work week')."
                    rows={12}
                    className="min-h-[300px] rounded-3xl glass border-white/10 text-xl px-8 py-6 focus-visible:ring-primary/40 bg-white/5 font-light leading-relaxed placeholder:text-muted-foreground/30"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-center pt-10">
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="h-20 px-12 rounded-[2rem] font-black text-2xl uppercase tracking-tighter bg-primary text-primary-foreground shadow-[0_0_40px_rgba(var(--primary),0.3)] hover:shadow-[0_0_60px_rgba(var(--primary),0.5)] hover:scale-105 transition-all duration-500 animate-reveal"
            >
              {isLoading ? (
                <Loader2 className="mr-4 h-8 w-8 animate-spin" />
              ) : (
                <Zap className="mr-4 h-8 w-8 fill-current" />
              )}
              {isLoading ? "Architecting..." : "Launch Trajectory"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
