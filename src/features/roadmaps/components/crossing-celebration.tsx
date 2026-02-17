"use client";

import { useEffect, useState } from "react";
import { useConfetti } from "@/hooks/use-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, Flag } from "lucide-react";

interface CrossingCelebrationProps {
  progress: number; // 0 to 100
  roadmapTitle?: string;
  onClose: () => void;
}

export function CrossingCelebration({
  progress,
  roadmapTitle = "your roadmap",
  onClose,
}: CrossingCelebrationProps) {
  const { celebrate } = useConfetti();
  const [isOpen, setIsOpen] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  useEffect(() => {
    if (progress === 100 && !hasCelebrated) {
      // eslint-disable-next-line
      setIsOpen(true);
      setHasCelebrated(true);
      celebrate({ duration: 3000 });
    }
  }, [progress, hasCelebrated, celebrate]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md border-yellow-500/20 bg-gradient-to-b from-background to-yellow-500/5">
        <DialogHeader>
          <div className="mx-auto bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-full mb-4 animate-bounce">
            <Trophy className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            The Crossing Complete!
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            You have successfully built the bridge for <br />
            <span className="font-semibold text-foreground">
              &quot;{roadmapTitle}&quot;
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4 text-center">
          <p className="text-muted-foreground">
            This is a monumental step. You are no longer the same person who
            started this journey.
          </p>
          <div className="p-4 bg-muted rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
            <Flag className="w-4 h-4 text-green-500" />
            <span>Welcome to the other side.</span>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto font-semibold"
          >
            Archive & Start New Vision <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
