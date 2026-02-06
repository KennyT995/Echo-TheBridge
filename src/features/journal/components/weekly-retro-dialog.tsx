"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser, useFirestore } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FirestorePaths } from "@/lib/firestore-paths";
import { logger } from "@/lib/logger";
import {
  CalendarDays,
  Trophy,
  Target,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WeeklyRetroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  {
    id: "wins",
    title: "Weekly Wins",
    description: "What went well this week? Celebrate your progress.",
    icon: Trophy,
    placeholder: "I finally completed the...",
  },
  {
    id: "challenges",
    title: "Challenges & Learnings",
    description: "What got in the way? What did you learn?",
    icon: Target,
    placeholder: "I struggled with...",
  },
  {
    id: "next-week",
    title: "Focus for Next Week",
    description: "What is the ONE big thing you want to achieve next week?",
    icon: CalendarDays,
    placeholder: "My main focus is...",
  },
];

export function WeeklyRetroDialog({
  open,
  onOpenChange,
}: WeeklyRetroDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    wins: "",
    challenges: "",
    "next-week": "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user || !firestore) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(firestore, FirestorePaths.dailyLogs(user.uid)), {
        type: "weekly_retro",
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
        ...answers,
      });

      toast({
        title: "Weekly Review Complete",
        description: "Your insights have been saved. Ready for a new week!",
      });

      onOpenChange(false);
      // Reset after close
      setTimeout(() => {
        setCurrentStep(0);
        setAnswers({ wins: "", challenges: "", "next-week": "" });
      }, 500);
    } catch (error) {
      logger.error("[WeeklyRetroDialog] Failed to save retro:", error);
      toast({
        title: "Error",
        description: "Failed to save your review.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl glass-card border-white/5 p-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -z-10" />

        <DialogHeader className="p-8 pb-0">
          <div className="flex items-center gap-3 text-primary mb-4 animate-float">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <StepIcon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.4em]">
              Strategic Retrospective
            </span>
          </div>
          <DialogTitle className="text-4xl font-headline font-bold tracking-tighter">
            {steps[currentStep].title.split(' ')[0]} <span className="text-gradient">{steps[currentStep].title.split(' ').slice(1).join(' ')}</span>
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground/60 font-light mt-2 italic">
            &quot;{steps[currentStep].description}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <Textarea
            value={answers[steps[currentStep].id]}
            onChange={(e) =>
              setAnswers({
                ...answers,
                [steps[currentStep].id]: e.target.value,
              })
            }
            placeholder={steps[currentStep].placeholder}
            className="min-h-[250px] rounded-2xl glass border-white/10 text-xl px-8 py-6 focus-visible:ring-primary/40 bg-white/5 resize-none font-light leading-relaxed"
            autoFocus
          />

          <div className="flex justify-center gap-2 mt-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-500 ${index === currentStep ? "w-12 bg-primary" : "w-1.5 bg-white/10"
                  }`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 flex-row justify-between sm:justify-between w-full gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className="h-12 px-6 rounded-xl text-muted-foreground hover:bg-white/5 transition-all"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[steps[currentStep].id] || isSubmitting}
            className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 mr-3 animate-spin" />}
            {currentStep === steps.length - 1 ? "Complete Review" : "Next Objective"}
            {!isSubmitting && currentStep !== steps.length - 1 && (
              <ArrowRight className="w-5 h-5 ml-3" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
