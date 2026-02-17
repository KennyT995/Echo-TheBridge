import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Clock, Wifi, Lock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GenerateFutureLetterOutput } from "@/ai/flows/generate-future-letter";
import { useConfetti } from "@/hooks/use-confetti";
import { Badge } from "@/components/ui/badge";

interface FutureLetterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letter: GenerateFutureLetterOutput | null;
  isLoading: boolean;
  onGenerate: () => void;
}

export function FutureLetterModal({
  open,
  onOpenChange,
  letter,
  isLoading,
  onGenerate,
}: FutureLetterModalProps) {
  const { celebrate } = useConfetti();
  const [displayedBody, setDisplayedBody] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Confetti effect on mount if celebratory
  useEffect(() => {
    if (open && letter?.tone === "celebratory") {
      setTimeout(() => celebrate({ duration: 3000 }), 500);
    }
  }, [open, letter, celebrate]);

  // Typing effect
  useEffect(() => {
    if (letter && open) {
      setDisplayedBody("");
      setIsTyping(true);
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedBody(letter.body.slice(0, i + 1));
        i++;
        if (i > letter.body.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 15); // Speed of typing
      return () => clearInterval(interval);
    }
  }, [letter, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-black/90 border-indigo-500/30 backdrop-blur-3xl shadow-2xl shadow-indigo-500/20 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

        <DialogHeader className="relative z-10 pb-2 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] block opacity-70">
                  Temporal Bridge // Active
                </span>
                <DialogTitle className="text-xl font-headline font-bold tracking-tighter text-white">
                  Transmission from +5 Years
                </DialogTitle>
              </div>
            </div>

            {letter && (
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/5 backdrop-blur-sm">
                <Wifi className="w-3 h-3 mr-2 animate-pulse" />
                Signal: {letter.tone === "celebratory" ? "Resonant" : "Stable"}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 relative">
          {!letter && !isLoading && (
            <div className="text-center space-y-6 max-w-sm animate-reveal">
              <div className="w-24 h-24 bg-white/5 border border-white/5 rounded-full flex items-center justify-center mx-auto shadow-inner mb-6 relative">
                <Lock className="w-8 h-8 text-muted-foreground/40" />
                <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20" />
              </div>

              <div className="space-y-2">
                <DialogTitle className="text-xl font-bold font-headline">No Active Signal</DialogTitle>
                <DialogDescription className="text-muted-foreground/60 font-light">
                  The bridge to your future self is currently dormant. Initiate the protocol to receive guidance.
                </DialogDescription>
              </div>

              <Button
                onClick={onGenerate}
                size="lg"
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 group"
              >
                <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                Open Channel
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="text-center space-y-8 animate-pulse w-full max-w-md">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative w-full h-full bg-black/50 border border-indigo-500/50 rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-indigo-400 animate-spin-slow" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-indigo-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 animate-loading-bar" />
                </div>
                <p className="text-xs text-indigo-400 font-mono uppercase tracking-widest">
                  Decrypting Temporal Data Packets...
                </p>
              </div>
            </div>
          )}

          {letter && (
            <div className="w-full h-full flex flex-col animate-in fade-in zoom-in-95 duration-700">
              <div className="flex-1 bg-white/5 border border-white/5 shadow-2xl rounded-2xl p-8 relative overflow-hidden group">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                  <Send className="w-32 h-32 rotate-12" />
                </div>

                <div className="relative z-10 space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <span className="text-[10px] text-muted-foreground/40 font-mono uppercase tracking-widest block mb-1">Subject Line</span>
                    <h3 className="font-bold text-2xl tracking-tight text-white/90 font-headline">
                      {letter.subject}
                    </h3>
                  </div>

                  <ScrollArea className="h-[240px] pr-6">
                    <div className="prose prose-invert prose-lg leading-relaxed whitespace-pre-wrap font-light text-white/80">
                      {displayedBody}
                      {isTyping && <span className="inline-block w-2 h-5 bg-indigo-500 ml-1 animate-pulse" />}
                    </div>
                  </ScrollArea>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">Encrypted End-to-End</span>
                  </div>
                  <span className="text-xs font-mono text-indigo-400/60">
                    ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
