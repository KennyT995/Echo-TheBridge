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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Moon, Sparkles, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FirestorePaths } from "@/lib/firestore-paths";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";
import { useConfetti } from "@/hooks/use-confetti";

interface NightlyReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "win" | "learning" | "gratitude" | "preview";

interface ReviewData {
  win: string;
  learning: string;
  gratitude: string;
}

export function NightlyReviewDialog({
  open,
  onOpenChange,
}: NightlyReviewDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { celebrate } = useConfetti();
  const [step, setStep] = useState<Step>("win");
  const [data, setData] = useState<ReviewData>({
    win: "",
    learning: "",
    gratitude: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: Step[] = ["win", "learning", "gratitude", "preview"];
  const currentStepIndex = steps.indexOf(step);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!user || !firestore) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, FirestorePaths.dailyLogs(user.uid)), {
        ...data,
        createdAt: serverTimestamp(),
        type: "nightly_review",
        date: new Date().toISOString().split("T")[0],
      });

      toast({
        title: "Nightly Review Saved",
        description: "Great work today. Rest well.",
      });

      celebrate({ duration: 3000 });

      setData({ win: "", learning: "", gratitude: "" });
      setStep("win");
      onOpenChange(false);
    } catch (error) {
      logger.error("[NightlyReviewDialog] Failed to save review:", error);
      toast({
        title: "Error",
        description: "Failed to save your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl glass-card border-white/5 p-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -z-10" />

        <DialogHeader className="p-8 pb-0">
          <div className="flex items-center gap-3 text-primary mb-4 animate-float">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Moon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.4em]">
              Precision Review
            </span>
          </div>
          <DialogTitle className="text-4xl font-headline font-bold tracking-tighter">
            Close the <span className="text-gradient">Loop</span>
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground/60 font-light mt-2">
            Phase {currentStepIndex + 1} of {steps.length}: Finalizing today&apos;s trajectory.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 min-h-[350px]">
          {step === "win" && (
            <div className="space-y-6 animate-reveal">
              <Label className="text-2xl font-bold tracking-tight">
                Identify your primary success today.
              </Label>
              <p className="text-lg text-muted-foreground/60 font-light">
                Even the most subtle advancement strengthens the bridge.
              </p>
              <Input
                placeholder="I achieved..."
                value={data.win}
                onChange={(e) => setData({ ...data, win: e.target.value })}
                className="h-16 rounded-2xl glass border-white/10 text-xl px-6 focus-visible:ring-primary/40 bg-white/5"
                autoFocus
              />
            </div>
          )}

          {step === "learning" && (
            <div className="space-y-6 animate-reveal">
              <Label className="text-2xl font-bold tracking-tight">What insight did you capture?</Label>
              <p className="text-lg text-muted-foreground/60 font-light">
                Knowledge is the currency of the future.
              </p>
              <Input
                placeholder="I realized that..."
                value={data.learning}
                onChange={(e) => setData({ ...data, learning: e.target.value })}
                className="h-16 rounded-2xl glass border-white/10 text-xl px-6 focus-visible:ring-primary/40 bg-white/5"
                autoFocus
              />
            </div>
          )}

          {step === "gratitude" && (
            <div className="space-y-6 animate-reveal">
              <Label className="text-2xl font-bold tracking-tight">
                Express ultimate gratitude.
              </Label>
              <p className="text-lg text-muted-foreground/60 font-light">
                Focus on one specific element of your environment.
              </p>
              <Input
                placeholder="I am profoundly grateful for..."
                value={data.gratitude}
                onChange={(e) =>
                  setData({ ...data, gratitude: e.target.value })
                }
                className="h-16 rounded-2xl glass border-white/10 text-xl px-6 focus-visible:ring-primary/40 bg-white/5"
                autoFocus
              />
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-6 animate-reveal">
              <h3 className="text-2xl font-bold tracking-tight">Transmission Summary</h3>
              <div className="grid gap-3">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Primary Win</span>
                  <p className="text-lg font-light leading-snug">{data.win}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Captured Insight</span>
                  <p className="text-lg font-light leading-snug">{data.learning}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Gratitude Anchor</span>
                  <p className="text-lg font-light leading-snug">{data.gratitude}</p>
                </div>
              </div>

              <div className="bg-primary/5 backdrop-blur-xl p-4 rounded-2xl border border-primary/20 text-xs text-primary/80 flex gap-3">
                <Sparkles className="w-5 h-5 shrink-0 text-primary animate-pulse" />
                <p className="leading-relaxed">
                  This data is being integrated into your neural roadmap to optimize
                  tomorrow&apos;s morning strategic briefing.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-8 pt-0 flex-row justify-between sm:justify-between w-full gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="h-12 px-6 rounded-xl text-muted-foreground hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="w-5 h-5 mr-3" /> Back
          </Button>

          {step === "preview" ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              {isSubmitting ? "Integrating..." : "Seal the Day"}{" "}
              <Check className="w-5 h-5 ml-3" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!data[step]}
              className="h-12 px-8 rounded-xl bg-foreground text-background font-bold hover:bg-foreground/90 transition-all"
            >
              Advance <ChevronRight className="w-5 h-5 ml-3" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
