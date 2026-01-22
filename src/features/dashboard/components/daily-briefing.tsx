import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sun, Coffee, Shield, Plus, X, Check, Crosshair } from "lucide-react";
import { Roadmap } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useFocus } from "@/features/focus/context/focus-context";
import { useEffect, useState, useMemo } from "react";
import { getDailyBriefing } from "@/app/actions";
import { GenerateDailyBriefingOutput } from "@/ai/flows/generate-daily-briefing";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useFirestore } from "@/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

interface AntiGoal {
    id: string;
    text: string;
    completed: boolean;
}

interface DailyBriefingProps {
    userName?: string | null;
    roadmaps: Record<string, Roadmap>;
    className?: string;
    activeVisionTitle?: string;
    recentReflection?: string;
}

export function DailyBriefing({ userName, roadmaps, className, activeVisionTitle, recentReflection }: DailyBriefingProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [briefing, setBriefing] = useState<GenerateDailyBriefingOutput | null>(null);
    const [loading, setLoading] = useState(false);
    const { setFocus } = useFocus();

    // Anti-Goals State
    const [antiGoals, setAntiGoals] = useState<AntiGoal[]>([]);
    const [newAntiGoal, setNewAntiGoal] = useState("");

    // Collect today's habits
    const todaysHabits = useMemo(() => Object.values(roadmaps).flatMap(r =>
        r.dailyHabits?.filter(h => !h.completed).map(h => h.text) || []
    ), [roadmaps]);

    const pendingCount = todaysHabits.length;

    const today = new Date();
    const dateKey = today.toISOString().split('T')[0];
    const greeting = getGreeting(today.getHours());

    // Fetch Daily Briefing Logic
    // Fetch Daily Briefing Logic
    useEffect(() => {
        const fetchBriefing = async () => {
            if (!activeVisionTitle && todaysHabits.length === 0) return;

            const now = new Date();
            const cacheKey = `daily-briefing-${now.toDateString()}`;
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                setBriefing(JSON.parse(cached));
                return;
            }

            setLoading(true);
            const result = await getDailyBriefing({
                userName: userName || 'Visionary',
                activeVisionTitle,
                todaysHabits: todaysHabits.slice(0, 5),
                recentReflection
            });

            if (result.briefing) {
                setBriefing(result.briefing);
                sessionStorage.setItem(cacheKey, JSON.stringify(result.briefing));
            }
            setLoading(false);
        };

        fetchBriefing();
    }, [activeVisionTitle, userName, todaysHabits, recentReflection]);

    // ... (anti goals logic skipped in replace, assume context matches)

    // We only touched the first useEffect block.
    // Wait, replace_file_content needs strict range.
    // I can't skip content.
    // I'll target the useEffect specifically.

    // And the quote at 191.
    // I'll use multi_replace.


    // Fetch Anti-Goals Logic
    useEffect(() => {
        if (!user || !firestore) return;

        const docRef = doc(firestore, 'users', user.uid, 'daily_plans', dateKey);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setAntiGoals(data.antiGoals || []);
            } else {
                setAntiGoals([]);
            }
        });

        return () => unsubscribe();
    }, [user, firestore, dateKey]);

    const handleAddAntiGoal = async () => {
        if (!newAntiGoal.trim() || !user || !firestore) return;

        const newItem: AntiGoal = {
            id: crypto.randomUUID(),
            text: newAntiGoal.trim(),
            completed: false
        };

        const updatedList = [...antiGoals, newItem];
        const docRef = doc(firestore, 'users', user.uid, 'daily_plans', dateKey);

        await setDoc(docRef, { antiGoals: updatedList }, { merge: true });
        setNewAntiGoal("");
    };

    const toggleAntiGoal = async (id: string, currentStatus: boolean) => {
        if (!user || !firestore) return;

        const updatedList = antiGoals.map(item =>
            item.id === id ? { ...item, completed: !currentStatus } : item
        );

        const docRef = doc(firestore, 'users', user.uid, 'daily_plans', dateKey);
        await setDoc(docRef, { antiGoals: updatedList }, { merge: true });
    };

    const deleteAntiGoal = async (id: string) => {
        if (!user || !firestore) return;
        const updatedList = antiGoals.filter(item => item.id !== id);
        const docRef = doc(firestore, 'users', user.uid, 'daily_plans', dateKey);
        await setDoc(docRef, { antiGoals: updatedList }, { merge: true });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddAntiGoal();
        }
    };

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
                <div className="text-base text-muted-foreground mt-2">
                    {loading ? (
                        <Skeleton className="h-4 w-64" />
                    ) : briefing ? (
                        <span className="italic">&quot;{briefing.quote}&quot;</span>
                    ) : (
                        "The secret of your future is hidden in your daily routine."
                    )}
                </div>
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
                                <p className="font-medium">Today&apos;s Bridge</p>
                                <p className="text-sm text-muted-foreground">
                                    {pendingCount > 0
                                        ? `You have ${pendingCount} habits pending today.`
                                        : "You're all caught up for today!"}
                                </p>
                            </div>
                        </div>
                        {pendingCount > 0 && (
                            <div className="hidden sm:block">
                                <ul className="space-y-2 mt-2">
                                    {todaysHabits.slice(0, 3).map((habit: string, i: number) => (
                                        <li key={i} className="flex items-center justify-between text-sm bg-background/50 p-2 rounded border border-indigo-100/50 dark:border-indigo-900/30">
                                            <span className="truncate max-w-[200px]">{habit}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                title="Set as Focus Anchor"
                                                onClick={() => setFocus(habit, activeVisionTitle || 'Daily Habit')}
                                            >
                                                <Crosshair className="h-4 w-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                                {pendingCount > 3 && (
                                    <p className="text-xs text-muted-foreground mt-2 text-center">
                                        + {pendingCount - 3} more
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Anti-Goals Section */}
                    <div className="p-4 bg-red-50/50 dark:bg-red-950/10 rounded-lg border border-red-100 dark:border-red-900/30">
                        <div className="flex items-center gap-2 mb-3 text-red-700 dark:text-red-400">
                            <Shield className="w-4 h-4" />
                            <h3 className="font-semibold text-sm uppercase tracking-wide">Anti-Goals (Not-To-Do List)</h3>
                        </div>

                        <div className="space-y-2 mb-3">
                            {antiGoals.map((goal) => (
                                <div key={goal.id} className="flex items-center justify-between group bg-background/50 p-2 rounded border border-transparent hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleAntiGoal(goal.id, goal.completed)}
                                            className={cn(
                                                "w-5 h-5 rounded flex items-center justify-center transition-colors border",
                                                goal.completed
                                                    ? "bg-red-100 border-red-200 text-red-600 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400"
                                                    : "border-muted-foreground/30 hover:border-red-400"
                                            )}
                                        >
                                            {goal.completed && <Check className="w-3 h-3" />}
                                        </button>
                                        <span className={cn("text-sm transition-all", goal.completed && "text-muted-foreground line-through decoration-red-300 dark:decoration-red-800")}>
                                            {goal.text}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => deleteAntiGoal(goal.id)}
                                        className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="I will avoid..."
                                value={newAntiGoal}
                                onChange={(e) => setNewAntiGoal(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="h-8 text-sm bg-background/80 border-red-200/50 focus-visible:ring-red-500/20 placeholder:text-red-300 dark:placeholder:text-red-800/50"
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleAddAntiGoal}
                                disabled={!newAntiGoal.trim()}
                                className="h-8 border-red-200/50 hover:bg-red-50 text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
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
