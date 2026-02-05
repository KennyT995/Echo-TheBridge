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
        "overflow-hidden border-border/50 shadow-lg bg-card transition-all duration-500",
        currentStreak > 0 && "ring-1 ring-orange-500/20 shadow-orange-500/5",
        className,
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Streak Section */}
          <div className="flex-1 p-6 flex flex-col justify-center items-center sm:items-start relative overflow-hidden">
            {currentStreak > 0 && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[40px] rounded-full -z-10 animate-pulse" />
            )}

            <div className="flex items-center gap-4 mb-2">
              <div
                className={cn(
                  "p-3 rounded-2xl transition-all duration-500",
                  currentStreak > 0
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-110"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Flame
                  className={cn(
                    "w-6 h-6",
                    currentStreak > 0 ? "fill-white animate-bounce" : "fill-none",
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold leading-none font-headline tracking-tighter">
                  {currentStreak}
                </span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1 pl-0.5">
                  Day Trajectory
                </span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="border-t sm:border-t-0 sm:border-l border-border/50 p-6 flex flex-row sm:flex-col justify-center gap-12 sm:gap-6 bg-muted/5">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Current</span>
              <span className="text-2xl font-bold font-headline">{currentStreak}</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Longest</span>
              <span className="text-2xl font-bold font-headline">{longestStreak}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
