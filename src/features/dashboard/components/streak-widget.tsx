import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

export function StreakWidget({
  currentStreak,
  longestStreak,
  className
}: StreakWidgetProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-white/5 glass-card transition-all duration-700 hover:-translate-y-1 animate-reveal",
        currentStreak > 0 && "ring-1 ring-orange-500/20 shadow-orange-500/10",
        className,
      )}
    >
      <CardContent className="p-0 relative overflow-hidden">
        {/* Glow effect */}
        {currentStreak > 0 && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full -z-10 animate-pulse" />
        )}

        <div className="flex flex-col sm:flex-row relative z-10">
          {/* Streak Section */}
          <div className="flex-1 p-8 flex flex-col justify-center items-center sm:items-start">
            <div className="flex items-center gap-6 mb-2">
              <div
                className={cn(
                  "p-4 rounded-3xl transition-all duration-700 transform",
                  currentStreak > 0
                    ? "bg-gradient-to-br from-orange-400 to-red-600 text-white shadow-[0_0_30px_rgba(249,115,22,0.4)] scale-110 rotate-3"
                    : "bg-white/5 text-muted-foreground border border-white/10",
                )}
              >
                <Flame
                  className={cn(
                    "w-8 h-8",
                    currentStreak > 0 ? "fill-white animate-pulse" : "fill-none",
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-5xl font-bold leading-none font-headline tracking-tighter text-gradient">
                  {currentStreak}
                </span>
                <span className="text-[11px] text-muted-foreground/60 font-bold uppercase tracking-[0.3em] mt-2 pl-1">
                  Day Momentum
                </span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="border-t sm:border-t-0 sm:border-l border-white/5 p-8 flex flex-row sm:flex-col justify-center gap-16 sm:gap-8 bg-white/5 backdrop-blur-xl">
            <div className="text-center sm:text-left group/stat">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 block mb-2 group-hover/stat:text-primary transition-colors">Current</span>
              <span className="text-3xl font-bold font-headline transition-all group-hover/stat:scale-110 block origin-left">{currentStreak}</span>
            </div>
            <div className="text-center sm:text-left group/stat">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 block mb-2 group-hover/stat:text-accent transition-colors">Longest</span>
              <span className="text-3xl font-bold font-headline transition-all group-hover/stat:scale-110 block origin-left">{longestStreak}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

