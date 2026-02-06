import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Split, GitMerge } from "lucide-react";
import type { AnalyzeVisionIntentOutput } from "@/ai/flows/analyze-vision-intent";

interface VisionConfirmationDialogProps {
  analysis: AnalyzeVisionIntentOutput | null;
  onConfirmUnified: () => void;
  onConfirmSeparate: () => void;
  isCreating: boolean;
  onCancel: () => void;
}

export function VisionConfirmationDialog({
  analysis,
  onConfirmUnified,
  onConfirmSeparate,
  isCreating,
  onCancel,
}: VisionConfirmationDialogProps) {
  if (!analysis) return null;

  return (
    <div className="animate-reveal py-8">
      <div className="mb-12 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2">
          Intelligence Insight
        </div>
        <h3 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter">
          Multidimensional <span className="text-gradient">Goals</span> Detected
        </h3>
        <p className="text-xl text-muted-foreground/60 font-light max-w-2xl mx-auto leading-relaxed">
          {analysis.reasoning}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
        <Card
          className="border-white/5 glass-card hover:border-primary/40 transition-all cursor-pointer group hover:-translate-y-2 duration-500 overflow-hidden relative"
          onClick={onConfirmSeparate}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
          <CardContent className="pt-10 p-8 flex flex-col h-full relative z-10">
            <div className="mb-8 p-4 bg-primary/10 w-fit rounded-2xl border border-primary/20 group-hover:scale-110 transition-transform duration-500">
              <Split className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-2xl mb-3 font-headline">Parallel Trajectories</h3>
            <p className="text-muted-foreground/60 mb-8 font-light leading-relaxed">
              Decompose your vision into distinct, focused roadmaps for maximum clarity.
            </p>
            <div className="space-y-3 mt-auto">
              {analysis.proposedVisions.map((vision, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 p-4 rounded-xl text-sm font-medium border border-white/5 group-hover:border-primary/20 transition-colors"
                >
                  {vision.title}
                </div>
              ))}
            </div>
            <Button
              className="w-full h-14 mt-8 rounded-xl font-bold text-lg"
              variant="default"
              disabled={isCreating}
            >
              Initialize Separate Flows
            </Button>
          </CardContent>
        </Card>

        <Card
          className="border-white/5 glass-card hover:border-accent/40 transition-all cursor-pointer group hover:-translate-y-2 duration-500 overflow-hidden relative"
          onClick={onConfirmUnified}
        >
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full" />
          <CardContent className="pt-10 p-8 flex flex-col h-full relative z-10">
            <div className="mb-8 p-4 bg-accent/10 w-fit rounded-2xl border border-accent/20 group-hover:scale-110 transition-transform duration-500">
              <GitMerge className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-bold text-2xl mb-3 font-headline">Unified Masterplan</h3>
            <p className="text-muted-foreground/60 mb-8 font-light leading-relaxed">
              Maintain singular focus and consolidate all elements into one integrated strategy.
            </p>
            <div className="bg-white/5 p-4 rounded-xl text-sm font-medium border border-white/5 group-hover:border-accent/20 transition-colors mt-auto">
              {analysis.unifiedVision.title}
            </div>
            <Button
              className="w-full h-14 mt-8 rounded-xl font-bold text-lg bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isCreating}
            >
              Sync as One Vision
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-12">
        <Button variant="ghost" onClick={onCancel} disabled={isCreating} className="h-12 px-8 text-muted-foreground/40 hover:text-foreground">
          Recalibrate Vision
        </Button>
      </div>
    </div>
  );
}

