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
import { useUser, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { FirestorePaths } from "@/lib/firestore-paths";
import { logger } from "@/lib/logger";

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

const FALLBACK_QUOTES = [
  "The secret of your future is hidden in your daily routine.",
  "Your direction is more important than your speed.",
  "The bridge between dreams and reality is discipline.",
  "Big things often have small beginnings.",
  "Focus on the step in front of you, not the whole staircase.",
  "Action is the foundational key to all success.",
  "The future is created by what you do today, not tomorrow.",
];

export function DailyBriefing({
  userName,
  roadmaps,
  className,
  activeVisionTitle,
  recentReflection,
}: DailyBriefingProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [briefing, setBriefing] = useState<GenerateDailyBriefingOutput | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const { setFocus } = useFocus();

  // Random fallback quote
  const fallbackQuote = useMemo(() => {
    const dayOfYear = Math.floor(
      (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      1000 /
      60 /
      60 /
      24,
    );
    return FALLBACK_QUOTES[dayOfYear % FALLBACK_QUOTES.length];
  }, []);

  // Anti-Goals State
  const [antiGoals, setAntiGoals] = useState<AntiGoal[]>([]);
  const [newAntiGoal, setNewAntiGoal] = useState("");

  // Collect today's habits
  const todaysHabits = useMemo(
    () =>
      Object.values(roadmaps).flatMap(
        (r) =>
          r.dailyHabits?.filter((h) => !h.completed).map((h) => h.text) || [],
      ),
    [roadmaps],
  );

  const pendingCount = todaysHabits.length;

  const today = new Date();
  const dateKey = today.toISOString().split("T")[0];
  const greeting = getGreeting(today.getHours());

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
        userName: userName || "Visionary",
        activeVisionTitle,
        todaysHabits: todaysHabits.slice(0, 5),
        recentReflection,
      });

      if (result.briefing) {
        setBriefing(result.briefing);
        sessionStorage.setItem(cacheKey, JSON.stringify(result.briefing));
      }
      setLoading(false);
    };

    fetchBriefing();
  }, [activeVisionTitle, userName, todaysHabits, recentReflection]);

  // Fetch Anti-Goals Logic
  useEffect(() => {
    if (!user || !firestore) return;

    const docRef = doc(firestore, FirestorePaths.dailyPlan(user.uid, dateKey));
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

  const handleAddAntiGoal = () => {
    if (!newAntiGoal.trim() || !user || !firestore) return;

    const newItem: AntiGoal = {
      id: crypto.randomUUID(),
      text: newAntiGoal.trim(),
      completed: false,
    };

    const updatedList = [...antiGoals, newItem];
    const docRef = doc(firestore, FirestorePaths.dailyPlan(user.uid, dateKey));

    setDocumentNonBlocking(docRef, { antiGoals: updatedList }, { merge: true });
    setNewAntiGoal("");
  };

  const toggleAntiGoal = (id: string, currentStatus: boolean) => {
    if (!user || !firestore) return;

    const updatedList = antiGoals.map((item) =>
      item.id === id ? { ...item, completed: !currentStatus } : item,
    );

    const docRef = doc(firestore, FirestorePaths.dailyPlan(user.uid, dateKey));
    setDocumentNonBlocking(docRef, { antiGoals: updatedList }, { merge: true });
  };

  const deleteAntiGoal = (id: string) => {
    if (!user || !firestore) return;
    const updatedList = antiGoals.filter((item) => item.id !== id);
    const docRef = doc(firestore, FirestorePaths.dailyPlan(user.uid, dateKey));
    setDocumentNonBlocking(docRef, { antiGoals: updatedList }, { merge: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddAntiGoal();
    }
  };

  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-background via-indigo-950/5 to-blue-950/10 border-white/5 glass-card relative overflow-hidden animate-reveal",
        className,
      )}
    >
      {/* Visual Glare */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full -z-10" />

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center gap-3 text-primary mb-4">
          <div className="p-2 bg-primary/10 rounded-2xl border border-primary/20 animate-float">
            <Sun className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.4em]">
            Morning Briefing
          </span>
        </div>
        <CardTitle className="text-4xl sm:text-6xl font-headline font-bold tracking-tighter leading-none">
          {greeting}, <br className="sm:hidden" />
          <span className="text-gradient">{userName?.split(" ")[0] || "Visionary"}</span>.
        </CardTitle>
        <div className="text-xl md:text-2xl text-muted-foreground/80 mt-6 max-w-2xl leading-relaxed font-light">
          {loading ? (
            <Skeleton className="h-8 w-3/4 bg-white/5" />
          ) : briefing ? (
            <span className="italic block">&quot;{briefing.quote}&quot;</span>
          ) : (
            <span className="italic block">&quot;{fallbackQuote}&quot;</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-4">
          {/* AI Insight Section */}
          {(briefing || loading) && (
            <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl group/insight">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-1/4 bg-white/5" />
                  <Skeleton className="h-4 w-full bg-white/5" />
                </div>
              ) : (
                briefing && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-widest border border-primary/20">
                        Strategic Focus
                      </span>
                      <span className="font-bold text-lg tracking-tight">
                        {briefing.focusConfig.focus}
                      </span>
                    </div>
                    <p className="text-base text-muted-foreground/80 leading-relaxed font-light italic">
                      &quot;{briefing.focusConfig.motivation}&quot;
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          {/* Habits Status */}
          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-primary/5 rounded-2xl border border-primary/10 group/habits transition-all hover:bg-primary/10">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="p-3 bg-primary/20 rounded-2xl text-primary border border-primary/20 animate-float">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg tracking-tight">Today&apos;s Trajectory</p>
                <p className="text-sm text-muted-foreground/60 font-medium">
                  {pendingCount > 0
                    ? `${pendingCount} critical anchors remaining.`
                    : "Optimal alignment achieved for today."}
                </p>
              </div>
            </div>
            {pendingCount > 0 && (
              <div className="w-full md:w-auto">
                <ul className="flex flex-wrap gap-2">
                  {todaysHabits.slice(0, 2).map((habit: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-xs bg-background/40 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5 hover:border-primary/40 transition-all cursor-default group/habit"
                    >
                      <span className="truncate max-w-[120px] font-medium">{habit}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-primary/40 hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Set as Focus Anchor"
                        onClick={() =>
                          setFocus(habit, activeVisionTitle || "Daily Habit")
                        }
                      >
                        <Crosshair className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                  {pendingCount > 2 && (
                    <li className="flex items-center px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      +{pendingCount - 2} More
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Anti-Goals Section */}
          <div className="p-6 bg-destructive/5 rounded-2xl border border-destructive/10 group/antigoals transition-all hover:bg-destructive/10">
            <div className="flex items-center gap-3 mb-4 text-destructive">
              <Shield className="w-5 h-5 animate-pulse" />
              <h3 className="font-bold text-sm uppercase tracking-[0.2em]">
                Defensive Moat (Anti-Goals)
              </h3>
            </div>

            <div className="space-y-2 mb-6">
              {antiGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between group/item bg-background/20 backdrop-blur-md p-3 rounded-xl border border-white/5 hover:border-destructive/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      role="checkbox"
                      aria-checked={goal.completed}
                      tabIndex={0}
                      onClick={() => toggleAntiGoal(goal.id, goal.completed)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          toggleAntiGoal(goal.id, goal.completed);
                        }
                      }}
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center transition-all border-2",
                        goal.completed
                          ? "bg-destructive border-destructive text-white scale-90"
                          : "border-white/10 hover:border-destructive/50 bg-white/5",
                      )}
                      aria-label={`Mark "${goal.text}" as ${goal.completed ? "incomplete" : "complete"
                        }`}
                    >
                      {goal.completed && <Check className="w-4 h-4" />}
                    </div>
                    <span
                      className={cn(
                        "text-base transition-all font-light",
                        goal.completed &&
                        "text-muted-foreground/40 line-through decoration-destructive/50",
                      )}
                    >
                      {goal.text}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAntiGoal(goal.id)}
                    className="h-8 w-8 rounded-lg text-muted-foreground/20 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/item:opacity-100 transition-all"
                    aria-label={`Delete "${goal.text}"`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="Declare what you must avoid..."
                value={newAntiGoal}
                onChange={(e) => setNewAntiGoal(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-12 text-base rounded-xl bg-background/40 border-white/5 focus-visible:ring-destructive/30 placeholder:text-muted-foreground/30 font-light italic"
              />
              <Button
                size="icon"
                onClick={handleAddAntiGoal}
                disabled={!newAntiGoal.trim()}
                className="h-12 w-12 rounded-xl bg-destructive text-white hover:bg-destructive/90 transition-all shadow-xl shadow-destructive/20 active:scale-90"
              >
                <Plus className="w-6 h-6" />
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
