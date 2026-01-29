
"use client";

import {
  useUser,
  useFirestore,
  useCollection,
  useDoc,
  useMemoFirebase,
} from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Loading from "../loading";

import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Eye,
  Zap,
  ArrowRight,
  MoreVertical,
  Trash2,
  BookOpen,
  Moon,
  Compass,
  Mail,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteVision, checkFutureLetter } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import type { Vision, Roadmap, UserData, PlanTier } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisionForm } from "@/features/visions/components/vision-form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { toJsDate } from "@/lib/utils";
import { calculateStreak } from "@/lib/streaks";
import { StreakWidget } from "@/features/dashboard/components/streak-widget";
import { DailyBriefing } from "@/features/dashboard/components/daily-briefing";
import { JournalDialog } from "@/features/journal/components/journal-dialog";
import { NightlyReviewDialog } from "@/features/journal/components/nightly-review-dialog";
import { DecisionDialog } from "@/features/journal/components/decision-dialog";
import { FutureLetterModal } from "@/features/dashboard/components/future-letter-modal";
import { GenerateFutureLetterOutput } from "@/ai/flows/generate-future-letter";
import { CrossingCelebration } from "@/features/roadmaps/components/crossing-celebration";
import { WeeklyRetroDialog } from "@/features/journal/components/weekly-retro-dialog";
import { BridgeVisualizer } from "@/features/roadmaps/components/bridge-visualizer";

function usePlan(userData: UserData | null | undefined) {
  const firestore = useFirestore();

  const planRef = useMemoFirebase(() => {
    if (!firestore || !userData?.planTierId) return null;
    return doc(firestore, "plan_tiers", userData.planTierId);
  }, [userData, firestore]);

  const { data: planData, isLoading: isPlanLoading } =
    useDoc<PlanTier>(planRef);

  return { plan: planData, isPlanLoading };
}

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateVisionOpen, setCreateVisionOpen] = useState(false);
  const [isJournalOpen, setJournalOpen] = useState(false);
  const [isNightlyReviewOpen, setNightlyReviewOpen] = useState(false);
  const [isDecisionOpen, setDecisionOpen] = useState(false);
  const [isFutureLetterOpen, setFutureLetterOpen] = useState(false);
  const [futureLetter, setFutureLetter] =
    useState<GenerateFutureLetterOutput | null>(null);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [completedRoadmap, setCompletedRoadmap] = useState<{
    id: string;
    visionTitle: string;
  } | null>(null);

  const [isWeeklyRetroOpen, setWeeklyRetroOpen] = useState(false);
  const today = new Date();
  const isSunday = today.getDay() === 0;

  const [visionToDelete, setVisionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteVision = async () => {
    if (!visionToDelete || !user) return;
    setIsDeleting(true);
    try {
      const result = await deleteVision(visionToDelete, user.uid);
      if (result.success) {
        toast({
          title: "Vision Deleted",
          description: "Your vision has been successfully deleted.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete vision.",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsDeleting(false);
      setVisionToDelete(null);
    }
  };

  const handleGenerateLetter = async () => {
    if (!user) return;
    setIsGeneratingLetter(true);
    try {
      // In a real app, we would fetch recent daily logs here to pass as context
      const { result, error } = await checkFutureLetter({
        userName: user.displayName || "Traveler",
        visions: visions?.map((v) => v.title) || [],
        streakCount: overallStats.currentStreak,
      });

      if (error || !result) {
        toast({
          title: "Connection Failed",
          description: "The signal from the future is weak. Try again later.",
          variant: "destructive",
        });
      } else {
        setFutureLetter(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const visionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, "users", user.uid, "visions"),
      orderBy("createdAt", "desc"),
    );
  }, [user, firestore]);
  const roadmapsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, "users", user.uid, "roadmaps");
  }, [user, firestore]);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, "users", user.uid);
  }, [user, firestore]);

  const { data: visions, isLoading: visionsLoading } =
    useCollection<Vision>(visionsQuery);
  const { data: roadmaps, isLoading: roadmapsLoading } =
    useCollection<Roadmap>(roadmapsQuery);
  const { data: userData, isLoading: isUserDataLoading } =
    useDoc<UserData>(userDocRef);
  const { plan, isPlanLoading } = usePlan(userData);

  const roadmapsById = useMemo(() => {
    return (
      roadmaps?.reduce(
        (acc, roadmap) => {
          acc[roadmap.id] = roadmap;
          return acc;
        },
        {} as Record<string, Roadmap>,
      ) || {}
    );
  }, [roadmaps]);

  const { overallStats, dailyProgress } = useMemo(() => {
    if (!roadmaps)
      return {
        overallStats: { currentStreak: 0, longestStreak: 0 },
        dailyProgress: { completed: 0, total: 0 },
      };

    // Consolidate history for streak
    const allHistory = roadmaps.flatMap((r) => r.history || []);
    const stats = calculateStreak(allHistory);

    // Calculate daily progress
    let completed = 0;
    let total = 0;

    roadmaps.forEach((r) => {
      if (r.dailyHabits) {
        total += r.dailyHabits.length;
        completed += r.dailyHabits.filter((h) => h.completed).length;
      }
    });

    return { overallStats: stats, dailyProgress: { completed, total } };
  }, [roadmaps]);

  useEffect(() => {
    if (!roadmaps || !visions) return;

    // Check if any roadmap just hit 100%
    const complete = roadmaps.find((r) => calculateOverallProgress(r) === 100);
    if (complete) {
      const vision = visions.find((v) => v.id === complete.visionId);
      setCompletedRoadmap({
        id: complete.id,
        visionTitle: vision?.title || "Unknown Vision",
      });
    }
  }, [roadmaps, visions]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const onVisionCreated = (visionId: string) => {
    setCreateVisionOpen(false);

    if (visionId === "dashboard") {
      toast({
        title: "Visions Created",
        description: "Your new visions have been added to your dashboard.",
      });
    } else {
      toast({
        title: "Success!",
        description: "Your new vision and roadmap have been created.",
      });
      router.push(`/vision/${visionId}`);
    }
  };

  const isLoading =
    isUserLoading ||
    visionsLoading ||
    roadmapsLoading ||
    isUserDataLoading ||
    isPlanLoading;

  if (isLoading || !user) {
    return <Loading />;
  }

  const visionCount = visions?.length ?? 0;
  const visionLimit = plan?.maxVisions ?? 0;
  const isLimitReached = visionCount >= visionLimit;

  const renderVisionsSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded mt-2" />
          </CardContent>
          <div className="p-6 pt-0">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              An overview of your life&apos;s aspirations.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFutureLetterOpen(true)}
              disabled={isLoading}
              className="text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
            >
              <Mail className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setJournalOpen(true)}
              disabled={isLoading}
            >
              <BookOpen className="mr-2 h-4 w-4" /> Journal
            </Button>
            <Button
              variant="outline"
              onClick={() => setDecisionOpen(true)}
              disabled={isLoading}
              className="border-indigo-200 hover:bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
            >
              <Compass className="mr-2 h-4 w-4" /> Align
            </Button>
            {isSunday && (
              <Button
                variant="default"
                onClick={() => setWeeklyRetroOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 animate-pulse"
              >
                <CalendarDays className="mr-2 h-4 w-4" /> Weekly Review
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setNightlyReviewOpen(true)}
              disabled={isLoading}
              className="border-indigo-200 hover:bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
            >
              <Moon className="mr-2 h-4 w-4" /> End Day
            </Button>
            <Button
              onClick={() =>
                isLimitReached
                  ? router.push("/plans")
                  : setCreateVisionOpen(true)
              }
              disabled={isLoading}
            >
              {isLimitReached ? "Limit Reached" : "New Vision"}
              {isLimitReached ? (
                <ArrowRight className="ml-2 h-4 w-4" />
              ) : (
                <PlusCircle className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-64 w-full" />
            {renderVisionsSkeletons()}
          </div>
        ) : (
          <>
            <div className="grid gap-6 mb-8">
              <DailyBriefing
                userName={userData?.displayName || user?.displayName}
                roadmaps={roadmapsById}
                activeVisionTitle={visions?.[0]?.title}
                // In a real implementation, fetch the latest journal entry for reflection context
                recentReflection=""
              />
              <StreakWidget
                currentStreak={overallStats.currentStreak}
                longestStreak={overallStats.longestStreak}
              />
            </div>

            <h2 className="text-2xl font-bold tracking-tighter mt-12 mb-6">
              Your Visions
            </h2>
            {visions && visions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visions.map((vision) => {
                  const visionRoadmap = roadmapsById[vision.id];
                  const progress = visionRoadmap
                    ? calculateOverallProgress(visionRoadmap)
                    : 0;

                  return (
                    <Card key={vision.id} className="flex flex-col">
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1 pr-4">
                          <CardTitle className="leading-tight">
                            {vision.title}
                          </CardTitle>
                          <CardDescription>
                            Created{" "}
                            {vision.createdAt && toJsDate(vision.createdAt)
                              ? formatDistanceToNow(
                                  toJsDate(vision.createdAt)!,
                                  { addSuffix: true },
                                )
                              : "just now"}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/vision/${vision.id}`}
                                className="cursor-pointer flex items-center"
                              >
                                <Eye className="mr-2 h-4 w-4" /> View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer flex items-center"
                              onClick={() => setVisionToDelete(vision.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {vision.goal || "No goal description provided."}
                        </p>

                        {visionRoadmap ? (
                          <div className="pt-2">
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-xs font-medium text-muted-foreground">
                                Overall Progress
                              </span>
                              <span className="text-xs font-bold text-primary">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <BridgeVisualizer
                              progress={progress}
                              className="h-10"
                            />
                          </div>
                        ) : (
                          <div className="pt-2 text-xs text-muted-foreground italic text-center">
                            No roadmap generated yet.
                          </div>
                        )}
                      </CardContent>
                      <div className="p-6 pt-0">
                        <Button asChild className="w-full">
                          <Link href={`/vision/${vision.id}`}>
                            <Eye className="mr-2" /> View Vision
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-muted rounded-xl bg-muted/10">
                <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">
                  No Visions Found
                </h3>
                <p className="text-muted-foreground text-center max-w-sm mb-6">
                  You haven&apos;t created any visions yet. Define your future
                  to get a personalized roadmap and AI coaching.
                </p>
                <Button
                  size="lg"
                  onClick={() => setCreateVisionOpen(true)}
                  disabled={isLoading || isLimitReached}
                  className="font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                >
                  {isLimitReached
                    ? "Upgrade to Create More"
                    : "Create Your First Vision"}
                  {isLimitReached ? (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  ) : (
                    <PlusCircle className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        <Dialog open={isCreateVisionOpen} onOpenChange={setCreateVisionOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create a New Vision</DialogTitle>
              <DialogDescription>
                Define your future. We&apos;ll architect the path.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[80vh] overflow-y-auto p-1">
              <VisionForm onVisionCreated={onVisionCreated} />
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={!!visionToDelete}
          onOpenChange={(open) => !open && setVisionToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                vision and its associated roadmap.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteVision();
                }}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <JournalDialog open={isJournalOpen} onOpenChange={setJournalOpen} />
        <NightlyReviewDialog
          open={isNightlyReviewOpen}
          onOpenChange={setNightlyReviewOpen}
        />
        <DecisionDialog
          open={isDecisionOpen}
          onOpenChange={setDecisionOpen}
          activeVisions={visions?.map((v) => v.title) || []}
        />
        <FutureLetterModal
          open={isFutureLetterOpen}
          onOpenChange={setFutureLetterOpen}
          letter={futureLetter}
          isLoading={isGeneratingLetter}
          onGenerate={handleGenerateLetter}
        />
        <CrossingCelebration
          progress={completedRoadmap ? 100 : 0}
          roadmapTitle={completedRoadmap?.visionTitle || ""}
          onClose={() => setCompletedRoadmap(null)}
        />
        <WeeklyRetroDialog
          open={isWeeklyRetroOpen}
          onOpenChange={setWeeklyRetroOpen}
        />
      </main>
    </>
  );
}

function calculateOverallProgress(roadmap: Roadmap): number {
  const allItems = [
    ...(roadmap.dailyHabits || []),
    ...(roadmap.weeklyTactics || []),
    ...(roadmap.monthlySprints || []),
    ...(roadmap.yearlyMilestones || []),
  ];
  if (allItems.length === 0) return 0;
  const completedItems = allItems.filter((item) => item.completed).length;
  return (completedItems / allItems.length) * 100;
}
