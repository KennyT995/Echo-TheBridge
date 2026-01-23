import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

export function StreakWidget({ currentStreak, className }: StreakWidgetProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-muted/50",
        className,
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Streak Section */}
          <div className="flex-1 p-6 flex flex-col justify-center items-center sm:items-start">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={cn(
                  "p-2 rounded-full",
                  currentStreak > 0
                    ? "bg-orange-500/10 text-orange-500"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Flame
                  className={cn(
                    "w-6 h-6",
                    currentStreak > 0 && "fill-orange-500 animate-pulse",
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold leading-none">
                  {currentStreak}
                </span>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Day Streak
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentStreak > 0
                ? "You're on fire! Keep it up."
                : "Start your streak today!"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
