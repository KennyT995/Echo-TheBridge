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
    <div className="animate-in fade-in zoom-in-95 duration-200">
      <div className="mb-6 text-center space-y-2">
        <h3 className="text-xl font-bold">
          I noticed multiple goals in your vision.
        </h3>
        <p className="text-muted-foreground">{analysis.reasoning}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        <Card
          className="border-2 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer group"
          onClick={onConfirmSeparate}
        >
          <CardContent className="pt-6 flex flex-col h-full">
            <div className="mb-4 p-3 bg-primary/10 w-fit rounded-full group-hover:bg-primary/20 transition-colors">
              <Split className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">Separate Roadmaps</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-grow">
              Create distinct roadmaps for each goal to keep them focused.
            </p>
            <div className="space-y-2 mt-auto">
              {analysis.proposedVisions.map((vision, idx) => (
                <div
                  key={idx}
                  className="bg-muted p-2 rounded text-sm font-medium"
                >
                  {vision.title}
                </div>
              ))}
            </div>
            <Button
              className="w-full mt-4"
              variant="outline"
              disabled={isCreating}
            >
              Separate Them
            </Button>
          </CardContent>
        </Card>

        <Card
          className="border-2 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer group"
          onClick={onConfirmUnified}
        >
          <CardContent className="pt-6 flex flex-col h-full">
            <div className="mb-4 p-3 bg-primary/10 w-fit rounded-full group-hover:bg-primary/20 transition-colors">
              <GitMerge className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">Unified Roadmap</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-grow">
              Keep everything in one single roadmap.
            </p>
            <div className="bg-muted p-2 rounded text-sm font-medium mt-auto">
              {analysis.unifiedVision.title}
            </div>
            <Button className="w-full mt-4" disabled={isCreating}>
              Keep Together
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-6">
        <Button variant="ghost" onClick={onCancel} disabled={isCreating}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
