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
      console.error(err);
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
        collection(firestore, "users", user.uid, "decision_journal"),
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
      console.error("Error saving decision:", error);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-indigo-500 mb-2">
            <Compass className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Decision Alignment
            </span>
          </div>
          <DialogTitle>Check Your Compass</DialogTitle>
          <DialogDescription>
            Is this opportunity aligned with your Vision? Let&apos;s analyze it.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {!analysis ? (
            <div className="space-y-4">
              <Label>What is the decision or opportunity?</Label>
              <Textarea
                placeholder="I'm considering taking a new job at..."
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="text-xs text-muted-foreground">
                Analyzing against{" "}
                <strong>{activeVisions.length} active visions</strong>.
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Alignment Score</h3>
                <div
                  className={cn(
                    "text-2xl font-bold px-3 py-1 rounded-md",
                    getScoreColor(analysis.score),
                  )}
                >
                  {analysis.score}/10
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase text-muted-foreground">
                    Recommendation
                  </span>
                  <p className="font-medium text-foreground">
                    {analysis.recommendation}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase text-muted-foreground">
                    Analysis
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!analysis ? (
            <Button
              onClick={handleAnalyze}
              disabled={!decision.trim() || isAnalyzing}
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />{" "}
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Alignment <Sparkles className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" onClick={() => setAnalysis(null)}>
                Back
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save to Journal"}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
