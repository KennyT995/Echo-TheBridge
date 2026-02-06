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
import { Moon, Sparkles } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FirestorePaths } from "@/lib/firestore-paths";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

interface JournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JournalDialog({ open, onOpenChange }: JournalDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [entry, setEntry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !firestore || !entry.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, FirestorePaths.dailyLogs(user.uid)), {
        content: entry,
        createdAt: serverTimestamp(),
        type: "evening_reflection",
      });

      toast({
        title: "Reflection Saved",
        description: "Your insights have been captured. Rest well.",
      });

      setEntry("");
      onOpenChange(false);
    } catch (error) {
      logger.error("[JournalDialog] Failed to save reflection:", error);
      toast({
        title: "Error",
        description: "Failed to save your reflection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl glass-card border-white/5 p-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full -z-10" />

        <DialogHeader className="p-8 pb-0">
          <div className="flex items-center gap-3 text-indigo-400 mb-4 animate-float">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Moon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.4em]">
              Evening Reflection
            </span>
          </div>
          <DialogTitle className="text-4xl font-headline font-bold tracking-tighter">
            Close the <span className="text-gradient">Circle</span>
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground/60 font-light mt-2">
            Decompress. What insights did today reveal to you?
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="journal-entry" className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Your Thoughts</Label>
            <Textarea
              id="journal-entry"
              placeholder="The most significant moment today was..."
              className="min-h-[250px] rounded-2xl glass border-white/10 text-lg px-6 py-4 focus-visible:ring-indigo-500/40 bg-white/5 resize-none leading-relaxed"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
            />
          </div>

          <div className="bg-indigo-500/5 backdrop-blur-xl p-4 rounded-2xl border border-indigo-500/10 text-xs text-indigo-300 flex gap-3">
            <Sparkles className="w-5 h-5 shrink-0 text-indigo-400 animate-pulse" />
            <p className="leading-relaxed">
              Your AI Architect will synthesize this reflection to recalibrate your
              calibration of tomorrow&apos;s strategic objectives.
            </p>
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-12 px-6 rounded-xl hover:bg-white/5 text-muted-foreground"
          >
            Defer Reflection
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!entry.trim() || isSubmitting}
            className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            {isSubmitting ? "Synchronizing..." : "Seal the Day"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
