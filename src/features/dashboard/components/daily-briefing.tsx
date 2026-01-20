import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Coffee, ArrowRight, Quote, Loader2 } from "lucide-react";
import { Roadmap } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getDailyBriefing } from "@/app/actions";
import { GenerateDailyBriefingOutput } from "@/ai/flows/generate-daily-briefing";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyBriefingProps {
    userName?: string | null;
    roadmaps: Record<string, Roadmap>;
    className?: string;
    activeVisionTitle?: string;
    recentReflection?: string;
}

export function DailyBriefing({ userName, roadmaps, className, activeVisionTitle, recentReflection }: DailyBriefingProps) {
    const [briefing, setBriefing] = useState<GenerateDailyBriefingOutput | null>(null);
    const [loading, setLoading] = useState(false);

    // Collect today's habits
    const todaysHabits = Object.values(roadmaps).flatMap(r =>
        r.dailyHabits?.filter(h => !h.completed).map(h => h.text) || []
    );
    const pendingCount = todaysHabits.length;

    const today = new Date();
    const greeting = getGreeting(today.getHours());

    useEffect(() => {
        // Determine if we should fetch. 
        // In a real app, we might check a cache or a "lastFetched" timestamp to avoid over-fetching.
        // For now, we fetch on mount if habits exist or we have a vision.
        const fetchBriefing = async () => {
            if (!activeVisionTitle && todaysHabits.length === 0) return;

            // Simple session storage cache to prevent re-fetching on every nav in the same session
            const cacheKey = `daily-briefing-${today.toDateString()}`;
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                setBriefing(JSON.parse(cached));
                return;
            }

            setLoading(true);
            const result = await getDailyBriefing({
                userName: userName || 'Visionary',
                activeVisionTitle,
                todaysHabits: todaysHabits.slice(0, 5), // Limit to top 5
                recentReflection
            });

            if (result.briefing) {
                setBriefing(result.briefing);
                sessionStorage.setItem(cacheKey, JSON.stringify(result.briefing));
            }
            setLoading(false);
        };

        fetchBriefing();
    }, [activeVisionTitle, userName]); // Reduced dependencies to avoid loop

    return (
        <Card className={cn("bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-100 dark:border-indigo-900/50", className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                    <Sun className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Morning Briefing</span>
                </div>
                <CardTitle className="text-2xl sm:text-3xl">
                    {greeting}, {userName?.split(' ')[0] || 'Visionary'}.
                </CardTitle>
                <CardDescription className="text-base mt-2">
                    {loading ? (
                        <Skeleton className="h-4 w-64" />
                    ) : briefing ? (
                        <span className="italic">"{briefing.quote}"</span>
                    ) : (
                        "The secret of your future is hidden in your daily routine."
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mt-4 space-y-4">
                    {/* AI Insight Section */}
                    {(briefing || loading) && (
                        <div className="p-4 bg-background/60 backdrop-blur-md rounded-lg border border-border/50 shadow-sm">
                            {loading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            ) : (
                                briefing && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2 py-0.5 rounded uppercase">Focus</span>
                                            <span className="font-semibold text-foreground">{briefing.focusConfig.focus}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {briefing.focusConfig.motivation}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {/* Habits Status */}
                    <div className="flex items-center justify-between p-4 bg-background/40 rounded-lg border border-border/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400">
                                <Coffee className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium">Today's Bridge</p>
                                <p className="text-sm text-muted-foreground">
                                    {pendingCount > 0
                                        ? `You have ${pendingCount} habits pending today.`
                                        : "You're all caught up for today!"}
                                </p>
                            </div>
                        </div>
                        {pendingCount > 0 && (
                            <Button size="sm" variant="ghost" className="hidden sm:flex" asChild>
                                <a href="#habits-section">
                                    View <ArrowRight className="ml-2 w-4 h-4" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function getGreeting(hour: number): string {
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
}
