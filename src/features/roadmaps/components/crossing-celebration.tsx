"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
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
  const [isOpen, setIsOpen] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // multiple origins to fill screen
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  useEffect(() => {
    if (progress === 100 && !hasCelebrated) {
      // eslint-disable-next-line
      setIsOpen(true);
      setHasCelebrated(true);
      triggerConfetti();
    }
  }, [progress, hasCelebrated]);

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
