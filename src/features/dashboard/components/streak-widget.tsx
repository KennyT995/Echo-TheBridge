import { Card, CardContent } from "@/components/ui/card";
import { Flame, CheckCircle2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { BridgeVisualizer } from "@/features/roadmaps/components/bridge-visualizer";

interface StreakWidgetProps {
    currentStreak: number;
    longestStreak: number;
    completedToday: number;
    totalHabits: number;
    className?: string;
}

export function StreakWidget({
    currentStreak,
    completedToday,
    totalHabits,
    className
}: StreakWidgetProps) {
    const progress = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

    return (
        <Card className={cn("overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-muted/50", className)}>
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                    {/* Streak Section */}
                    <div className="flex-1 p-6 flex flex-col justify-center items-center sm:items-start border-b sm:border-b-0 sm:border-r border-border/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                                "p-2 rounded-full",
                                currentStreak > 0 ? "bg-orange-500/10 text-orange-500" : "bg-muted text-muted-foreground"
                            )}>
                                <Flame className={cn("w-6 h-6", currentStreak > 0 && "fill-orange-500 animate-pulse")} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold leading-none">{currentStreak}</span>
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Day Streak</span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {currentStreak > 0
                                ? "You're on fire! Keep it up."
                                : "Start your streak today!"}
                        </p>
                    </div>

                    {/* Daily Progress Section */}
                    <div className="flex-[1.5] p-6 flex flex-col justify-center">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    Today&apos;s Bridge
                                    {progress === 100 && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {completedToday} of {totalHabits} planks laid
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-bold text-primary">{Math.round(progress)}%</span>
                            </div>
                        </div>

                        <div className="relative pt-2 pb-4">
                            <BridgeVisualizer progress={progress} totalPlanks={Math.max(totalHabits, 5)} className="h-16" />
                        </div>

                        {progress === 100 && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Daily bridge built!
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
