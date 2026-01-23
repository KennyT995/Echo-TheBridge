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
import { useToast } from "@/hooks/use-toast";

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
      await addDoc(collection(firestore, "users", user.uid, "daily_logs"), {
        ...data,
        createdAt: serverTimestamp(),
        type: "nightly_review",
        date: new Date().toISOString().split("T")[0],
      });

      toast({
        title: "Nightly Review Saved",
        description: "Great work today. Rest well.",
      });

      setData({ win: "", learning: "", gratitude: "" });
      setStep("win");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving review:", error);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-indigo-500 mb-2">
            <Moon className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Nightly Review
            </span>
          </div>
          <DialogTitle>Close the Loop</DialogTitle>
          <DialogDescription>
            Step {currentStepIndex + 1} of {steps.length}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 min-h-[200px]">
          {step === "win" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <Label className="text-lg font-medium">
                What was your biggest win today?
              </Label>
              <p className="text-sm text-muted-foreground">
                Even a small step forward counts.
              </p>
              <Input
                placeholder="I finally..."
                value={data.win}
                onChange={(e) => setData({ ...data, win: e.target.value })}
                autoFocus
              />
            </div>
          )}

          {step === "learning" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <Label className="text-lg font-medium">What did you learn?</Label>
              <p className="text-sm text-muted-foreground">
                About yourself, your work, or the world.
              </p>
              <Input
                placeholder="I realized that..."
                value={data.learning}
                onChange={(e) => setData({ ...data, learning: e.target.value })}
                autoFocus
              />
            </div>
          )}

          {step === "gratitude" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <Label className="text-lg font-medium">
                What are you grateful for?
              </Label>
              <p className="text-sm text-muted-foreground">
                Focus on one specific thing.
              </p>
              <Input
                placeholder="I'm thankful for..."
                value={data.gratitude}
                onChange={(e) =>
                  setData({ ...data, gratitude: e.target.value })
                }
                autoFocus
              />
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-semibold text-lg">Your Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-muted/30 p-3 rounded">
                  <span className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Win
                  </span>
                  {data.win}
                </div>
                <div className="bg-muted/30 p-3 rounded">
                  <span className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Learning
                  </span>
                  {data.learning}
                </div>
                <div className="bg-muted/30 p-3 rounded">
                  <span className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Gratitude
                  </span>
                  {data.gratitude}
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-md text-xs text-indigo-800 dark:text-indigo-300 flex gap-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  This data will help calibrate your future plans and Morning
                  Briefings.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between w-full">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          {step === "preview" ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? "Saving..." : "Complete Review"}{" "}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!data[step]}>
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
