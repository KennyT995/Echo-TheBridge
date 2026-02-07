
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

import { checkFutureLetter } from "@/app/actions";
import { useDeleteVision } from "@/features/visions/hooks/use-delete-vision";
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
import type { Vision, Roadmap, UserData } from "@/lib/types";
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
import { calculateStreak } from "@/lib/streaks";
import { calculateOverallProgress } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { FirestorePaths } from "@/lib/firestore-paths";
import { logger } from "@/lib/logger";

// Feature Components
import { StreakWidget } from "@/features/dashboard/components/streak-widget";
import { DailyBriefing } from "@/features/dashboard/components/daily-briefing";
import { JournalDialog } from "@/features/journal/components/journal-dialog";
import { NightlyReviewDialog } from "@/features/journal/components/nightly-review-dialog";
import { DecisionDialog } from "@/features/journal/components/decision-dialog";
import { FutureLetterModal } from "@/features/dashboard/components/future-letter-modal";
import { GenerateFutureLetterOutput } from "@/ai/flows/generate-future-letter";
import { CrossingCelebration } from "@/features/roadmaps/components/crossing-celebration";
import { WeeklyRetroDialog } from "@/features/journal/components/weekly-retro-dialog";
import { usePlan } from "@/hooks/use-plan";

import { usePrevious } from "@/hooks/use-previous";

// Extracted Components
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { VisionsGrid } from "@/features/dashboard/components/visions-grid";
import { EmptyVisionsState } from "@/features/dashboard/components/empty-visions-state";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
  const { deleteVision, isDeleting } = useDeleteVision();
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const deleteConfirmationPhrase = "I want to delete this vision";

  const handleDeleteVision = async () => {
    if (!visionToDelete || !user) return;
    try {
      const result = await deleteVision(user.uid, visionToDelete);
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
      // isDeleting is managed by the hook, but we need to reset local state
      setVisionToDelete(null);
      setDeleteConfirmationInput("");
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
      logger.error("[DashboardPage] Future letter generation failed:", e);
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const visionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, FirestorePaths.visions(user.uid)),
      orderBy("createdAt", "desc"),
    );
  }, [user, firestore]);
  const roadmapsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, FirestorePaths.roadmaps(user.uid));
  }, [user, firestore]);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, FirestorePaths.user(user.uid));
  }, [user, firestore]);

  const { data: visions, isLoading: visionsLoading } =
    useCollection<Vision>(visionsQuery);
  const { data: roadmaps, isLoading: roadmapsLoading } =
    useCollection<Roadmap>(roadmapsQuery);
  const { data: userData, isLoading: isUserDataLoading } =
    useDoc<UserData>(userDocRef);
  const { plan, isPlanLoading } = usePlan(userData);

  const prevRoadmaps = usePrevious(roadmaps);

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

  const overallStats = useMemo(() => {
    if (!roadmaps) {
      return { currentStreak: 0, longestStreak: 0 };
    }
    const allHistory = roadmaps.flatMap((r) => r.history || []);
    return calculateStreak(allHistory);
  }, [roadmaps]);

  useEffect(() => {
    if (!roadmaps || !visions || !prevRoadmaps) return;

    // Find a roadmap that just newly reached 100%
    const newlyCompleted = roadmaps.find((roadmap) => {
      const prevRoadmap = prevRoadmaps.find((pr) => pr.id === roadmap.id);
      // Don't celebrate on initial load if it's already 100%
      if (!prevRoadmap) {
        return false;
      }

      const prevProgress = calculateOverallProgress(prevRoadmap);
      const currentProgress = calculateOverallProgress(roadmap);
      return currentProgress === 100 && prevProgress < 100;
    });

    if (newlyCompleted) {
      const vision = visions.find((v) => v.id === newlyCompleted.visionId);
      setCompletedRoadmap({
        id: newlyCompleted.id,
        visionTitle: vision?.title || "Unknown Vision",
      });
    }
  }, [roadmaps, visions, prevRoadmaps]);

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
        <DashboardHeader
          isLoading={isLoading}
          isLimitReached={isLimitReached}
          isSunday={isSunday}
          onOpenFutureLetter={() => setFutureLetterOpen(true)}
          onOpenJournal={() => setJournalOpen(true)}
          onOpenDecision={() => setDecisionOpen(true)}
          onOpenWeeklyRetro={() => setWeeklyRetroOpen(true)}
          onOpenNightlyReview={() => setNightlyReviewOpen(true)}
          onOpenCreateVision={() => setCreateVisionOpen(true)}
          onNavigateToPlans={() => router.push("/plans")}
        />

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
              <VisionsGrid
                visions={visions}
                roadmapsById={roadmapsById}
                onDeleteVision={setVisionToDelete}
              />
            ) : (
              <EmptyVisionsState
                isLoading={isLoading}
                isLimitReached={isLimitReached}
                onOpenCreateVision={() => setCreateVisionOpen(true)}
                onNavigateToPlans={() => router.push("/plans")}
              />
            )}
          </>
        )}

        {/* Dialogs and Modals */}
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
          onOpenChange={(open) => {
            if (!open) {
              setVisionToDelete(null);
              setDeleteConfirmationInput("");
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                vision and its associated roadmap.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2 space-y-4">
              <Label htmlFor="delete-confirm-dashboard">
                To confirm, type:{" "}
                <span className="font-mono text-primary/90">
                  &quot;{deleteConfirmationPhrase}&quot;
                </span>
              </Label>
              <Input
                id="delete-confirm-dashboard"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                placeholder={deleteConfirmationPhrase}
                className="border-destructive/50 focus:ring-destructive/50"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteVision();
                }}
                disabled={
                  isDeleting ||
                  deleteConfirmationInput !== deleteConfirmationPhrase
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isDeleting ? "Deleting..." : "Delete Vision"}
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
