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
import { Label } from "@/components/ui/label";
import { Compass, Sparkles } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FirestorePaths } from "@/lib/firestore-paths";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { checkDecisionAlignment } from "@/app/actions";
import { AnalyzeDecisionAlignmentOutput } from "@/ai/flows/analyze-decision-alignment";

interface DecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeVisions: string[];
}

export function DecisionDialog({
  open,
  onOpenChange,
  activeVisions,
}: DecisionDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [decision, setDecision] = useState("");
  const [analysis, setAnalysis] =
    useState<AnalyzeDecisionAlignmentOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAnalyze = async () => {
    if (!decision.trim()) return;
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { result, error } = await checkDecisionAlignment({
        decision,
        visions: activeVisions,
      });

      if (error || !result) {
        toast({
          title: "Analysis Failed",
          description: error || "Could not analyze decision.",
          variant: "destructive",
        });
      } else {
        setAnalysis(result);
      }
    } catch (err) {
      logger.error("[DecisionDialog] Analysis failed:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!user || !firestore || !decision || !analysis) return;
    setIsSaving(true);
    try {
      await addDoc(
        collection(firestore, FirestorePaths.decisions(user.uid)),
        {
          decision,
          visions: activeVisions,
          analysis,
          createdAt: serverTimestamp(),
        },
      );

      toast({
        title: "Decision Journaled",
        description: "Your decision and its alignment score have been saved.",
      });

      setDecision("");
      setAnalysis(null);
      onOpenChange(false);
    } catch (error) {
      logger.error("[DecisionDialog] Failed to save decision:", error);
      toast({
        title: "Error",
        description: "Failed to save to journal.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8)
      return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
    if (score >= 5)
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl glass-card border-white/5 p-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full -z-10" />

        <DialogHeader className="p-8 pb-0">
          <div className="flex items-center gap-3 text-indigo-400 mb-4 animate-float">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Compass className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.4em]">
              Strategic Alignment
            </span>
          </div>
          <DialogTitle className="text-4xl font-headline font-bold tracking-tighter">
            Check the <span className="text-gradient">Compass</span>
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground/60 font-light mt-2 italic">
            Calibrate new opportunities against your singular vision.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6">
          {!analysis ? (
            <div className="space-y-6">
              <Label className="text-xl font-bold tracking-tight">What is the critical pivot?</Label>
              <Textarea
                placeholder="Describe the opportunity or decision in high-fidelity detail..."
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="min-h-[200px] rounded-2xl glass border-white/10 text-xl px-8 py-6 focus-visible:ring-indigo-500/40 bg-white/5 resize-none font-light leading-relaxed"
                autoFocus
              />
              <div className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em]">
                Auditing against <span className="text-foreground">{activeVisions.length} active strategic visions</span>.
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-reveal">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold tracking-tight">Sync Calibration</h3>
                <div
                  className={cn(
                    "text-3xl font-black px-4 py-2 rounded-2xl shadow-xl",
                    getScoreColor(analysis.score),
                  )}
                >
                  {analysis.score * 10}%
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 group/rec transition-all hover:bg-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 block">Neural Recommendation</span>
                  <p className="text-xl font-bold font-headline leading-tight tracking-tight">
                    {analysis.recommendation}
                  </p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3 block">Strategic Rationale</span>
                  <p className="text-base text-muted-foreground/80 leading-relaxed font-light">
                    {analysis.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-8 pt-0 gap-4">
          {!analysis ? (
            <Button
              onClick={handleAnalyze}
              disabled={!decision.trim() || isAnalyzing}
              className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-xl font-bold shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="h-6 w-6 mr-3 animate-spin" />{" "}
                  Calibrating...
                </>
              ) : (
                <>
                  Analyze Flow <Sparkles className="h-6 w-6 ml-3" />
                </>
              )}
            </Button>
          ) : (
            <div className="flex gap-4 w-full justify-between">
              <Button
                variant="ghost"
                onClick={() => setAnalysis(null)}
                className="h-14 px-8 rounded-xl text-muted-foreground hover:bg-white/5 transition-all"
              >
                Back
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-14 px-10 rounded-xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all"
              >
                {isSaving ? "Archiving..." : "Commit Results"}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
