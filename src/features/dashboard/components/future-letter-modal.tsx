import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Sparkles, Send, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GenerateFutureLetterOutput } from "@/ai/flows/generate-future-letter";
import { cn } from "@/lib/utils";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-gradient-to-br from-card to-indigo-950/20 border-indigo-500/20">
        <DialogHeader>
          <div className="flex items-center gap-2 text-indigo-500 mb-2">
            <Mail className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Quantum Mail
            </span>
          </div>
          <DialogTitle className="text-2xl font-serif tracking-wide">
            Letters from Tomorrow
          </DialogTitle>
          <DialogDescription>
            Messages sent from the version of you who made it.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[300px] flex flex-col items-center justify-center p-4">
          {!letter && !isLoading && (
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                No unread messages. Sometimes the signal from the future needs a
                boost.
              </p>
              <Button onClick={onGenerate} className="gap-2">
                <Sparkles className="w-4 h-4" /> Connect to Future Self
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="text-center space-y-4 animate-pulse">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
              <p className="text-sm text-indigo-500 font-medium">
                Receiving transmission...
              </p>
            </div>
          )}

          {letter && (
            <div className="w-full animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-card border shadow-sm rounded-lg p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Send className="w-24 h-24" />
                </div>
                <h3 className="font-bold text-lg mb-4 border-b pb-2">
                  {letter.subject}
                </h3>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="prose dark:prose-invert prose-sm leading-relaxed whitespace-pre-line font-serif">
                    {letter.body}
                  </div>
                </ScrollArea>
                <div className="mt-6 pt-4 border-t flex justify-between items-center text-xs text-muted-foreground">
                  <span>Sent from 5 years in the future</span>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full bg-background border",
                      letter.tone === "encouraging" &&
                        "text-green-500 border-green-200",
                      letter.tone === "urgent" && "text-red-500 border-red-200",
                      letter.tone === "celebratory" &&
                        "text-blue-500 border-blue-200",
                    )}
                  >
                    Tone: {letter.tone}
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
