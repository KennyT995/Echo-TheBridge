"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import Loading from "@/app/loading";

import { doc } from "firebase/firestore";
import {
  Loader2,
  Wand2,
  Trash2,
  Share2,
  Copy,
  RefreshCw,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EditVisionDialog } from "@/features/visions/components/edit-vision-dialog";
import { getReflection, generateRoadmap } from "@/app/actions";
import type { GenerateRoadmapFromVisionInput } from "@/ai/flows/generate-roadmap-from-vision";
import { RoadmapSelectionDialog } from "@/features/roadmaps/components/roadmap-selection-dialog";
import { RoadmapDisplay } from "@/features/roadmaps/components/roadmap-display";
import {
  Vision,
  Roadmap,
  UserData,
  PlanTier,
  RoadmapSectionKey,
  VisionFormValues,
} from "@/lib/types";
import { FutureSelfChat } from "@/features/visions/components/future-self-chat";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
} from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function VisionDetailPage() {
  const { visionId } = useParams();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [userInput, setUserInput] = useState("");
  const [reflection, setReflection] = useState("");
  const [isReflecting, setIsReflecting] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [proposedRoadmap, setProposedRoadmap] = useState<Roadmap | null>(null);

  const shareUrl =
    typeof window !== "undefined" && user
      ? `${window.location.origin}/share/${user.uid}/${visionId}`
      : "";
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const deleteConfirmationPhrase = "I want to delete this vision";

  const [isRefocusModalOpen, setRefocusModalOpen] = useState(false);
  const [timelineFocus, setTimelineFocus] = useState("");
  const [yearlyFocus, setYearlyFocus] = useState("");
  const [monthlyFocus, setMonthlyFocus] = useState("");
  const [weeklyFocus, setWeeklyFocus] = useState("");
  const [dailyFocus, setDailyFocus] = useState("");
  const [sectionToRegenerate, setSectionToRegenerate] = useState<
    RoadmapSectionKey | "all"
  >("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Memoize Firestore references
  const visionRef = useMemoFirebase(() => {
    if (!user || !visionId) return null;
    return doc(firestore, "users", user.uid, "visions", visionId as string);
  }, [user, visionId, firestore]);

  const roadmapRef = useMemoFirebase(() => {
    if (!user || !visionId) return null;
    return doc(firestore, "users", user.uid, "roadmaps", visionId as string);
  }, [user, visionId, firestore]);

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, "users", user.uid);
  }, [user, firestore]);

  const { data: vision, isLoading: isVisionLoading } =
    useDoc<Vision>(visionRef);
  const { data: roadmap, isLoading: isRoadmapLoading } =
    useDoc<Roadmap>(roadmapRef);
  const { data: userData, isLoading: isUserDataLoading } =
    useDoc<UserData>(userRef);

  // Conditionally fetch the plan only when userData is available
  const { plan, isPlanLoading } = usePlan(userData);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleReflection = async () => {
    if (!vision || !plan?.aiFeaturesEnabled) return;

    setIsReflecting(true);
    setReflection("");
    const visionString = `Title: ${vision.title}\nGoal: ${vision.goal}`;
    const result = await getReflection(userInput, visionString);
    if (result.strategicBriefing) {
      setReflection(result.strategicBriefing);
    }
    setIsReflecting(false);
  };

  const handleRegenerate = async () => {
    if (!vision || !roadmapRef || !visionRef || !roadmap) return;
    setIsRegenerating(true);

    const completedTasks = [
      ...(roadmap.visionTimeline || []),
      ...roadmap.yearlyMilestones,
      ...roadmap.monthlySprints,
      ...roadmap.weeklyTactics,
      ...roadmap.dailyHabits,
    ]
      .filter((task) => task.completed)
      .map((task) => task.text);

    const regenerationInput: VisionFormValues &
      Partial<GenerateRoadmapFromVisionInput> = {
      title: vision.title,
      goal: vision.goal,
      category: vision.category,
      isPublic: vision.isPublic,
      completedTasks,
      ...((sectionToRegenerate === "all" ||
        sectionToRegenerate === "visionTimeline") && { timelineFocus }),
      ...((sectionToRegenerate === "all" ||
        sectionToRegenerate === "yearlyMilestones") && { yearlyFocus }),
      ...((sectionToRegenerate === "all" ||
        sectionToRegenerate === "monthlySprints") && { monthlyFocus }),
      ...((sectionToRegenerate === "all" ||
        sectionToRegenerate === "weeklyTactics") && { weeklyFocus }),
      ...((sectionToRegenerate === "all" ||
        sectionToRegenerate === "dailyHabits") && { dailyFocus }),
    };

    const result = await generateRoadmap(regenerationInput);

    setIsRegenerating(false);
    setRefocusModalOpen(false);
    setTimelineFocus("");
    setYearlyFocus("");
    setMonthlyFocus("");
    setWeeklyFocus("");
    setDailyFocus("");

    if (result.error || !result.roadmap) {
      toast({
        variant: "destructive",
        title: "Error Regenerating Roadmap",
        description: result.error || "An unknown error occurred.",
      });
      return;
    }

    const newRoadmapData = { ...result.roadmap };
    setProposedRoadmap(newRoadmapData as Roadmap);
  };

  const handleConfirmRoadmap = async (selectedRoadmap: Roadmap) => {
    if (!roadmapRef || !roadmap) return;

    // Create a new object for the update, starting with the existing roadmap data.
    const finalRoadmapData = { ...roadmap };

    // Initialize history if it doesn't exist
    if (!finalRoadmapData.history) {
      finalRoadmapData.history = [];
    }

    const sectionsToProcess: RoadmapSectionKey[] =
      sectionToRegenerate && sectionToRegenerate !== "all"
        ? [sectionToRegenerate]
        : [
            "visionTimeline",
            "yearlyMilestones",
            "monthlySprints",
            "weeklyTactics",
            "dailyHabits",
          ];

    // Archive completed tasks from the sections we are about to overwrite
    sectionsToProcess.forEach((section) => {
      const currentItems = roadmap[section] || [];
      const completedItems = currentItems.filter((item) => item.completed);

      completedItems.forEach((item) => {
        finalRoadmapData.history!.push({
          text: item.text,
          completedAt: new Date(),
          section: section,
        });
      });
    });

    if (sectionToRegenerate && sectionToRegenerate !== "all") {
      // If we only regenerated ONE section, we take the user's selections
      // for JUST that section and merge it into our existing roadmap.
      // This preserves all other sections as they were.
      finalRoadmapData[sectionToRegenerate] =
        selectedRoadmap[sectionToRegenerate];
    } else {
      // If we regenerated the WHOLE roadmap, we replace it entirely with the user's selections.
      finalRoadmapData.visionTimeline = selectedRoadmap.visionTimeline;
      finalRoadmapData.yearlyMilestones = selectedRoadmap.yearlyMilestones;
      finalRoadmapData.monthlySprints = selectedRoadmap.monthlySprints;
      finalRoadmapData.weeklyTactics = selectedRoadmap.weeklyTactics;
      finalRoadmapData.dailyHabits = selectedRoadmap.dailyHabits;
    }

    await updateDocumentNonBlocking(roadmapRef, finalRoadmapData);
    setProposedRoadmap(null);
    setSectionToRegenerate("all"); // Reset state

    toast({
      title: "Roadmap Updated!",
      description:
        "Your selection has been saved and completed tasks archived.",
    });
  };

  const handleRegenerateSection = (section: RoadmapSectionKey) => {
    setSectionToRegenerate(section);
    setRefocusModalOpen(true);
  };

  const handleDelete = () => {
    if (visionRef && roadmapRef) {
      deleteDocumentNonBlocking(visionRef);
      deleteDocumentNonBlocking(roadmapRef);
      toast({
        title: "Vision Deleted",
        description: "Your vision has been removed.",
      });
      router.push("/dashboard");
    }
  };

  const handleIsPublicChange = (isPublic: boolean) => {
    if (visionRef) {
      updateDocumentNonBlocking(visionRef, { isPublic });
    }
  };

  const handleUpdateVision = async (title: string, category: string) => {
    if (visionRef) {
      await updateDocumentNonBlocking(visionRef, { title, category });
      toast({
        title: "Vision Updated",
        description: "Your vision details have been saved.",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Copied!", description: "Share link copied to clipboard." });
  };

  const isLoading =
    isUserLoading ||
    isVisionLoading ||
    isRoadmapLoading ||
    isUserDataLoading ||
    isPlanLoading;

  if (isLoading || !user) {
    return <Loading />;
  }

  if (isVisionLoading || isRoadmapLoading || !vision || !roadmap) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 space-y-4 flex justify-between items-start">
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4 max-w-2xl" />
            <Skeleton className="h-6 w-1/2 max-w-xl" />
          </div>
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary sm:text-5xl">
                {vision.title}
              </h1>
              <Badge variant="secondary" className="mt-2">
                {vision.category}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button
                variant="outline"
                disabled={isRegenerating}
                onClick={() => {
                  setSectionToRegenerate("all");
                  setRefocusModalOpen(true);
                }}
              >
                {isRegenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Regenerate
              </Button>
              <Button variant="outline" onClick={() => setShareModalOpen(true)}>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <AlertDialog onOpenChange={() => setDeleteConfirmationInput("")}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your vision and its entire
                      roadmap. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="py-2 space-y-4">
                    <Label htmlFor="delete-confirm">
                      To confirm, type:{" "}
                      <span className="font-mono text-primary/90">
                        &quot;{deleteConfirmationPhrase}&quot;
                      </span>
                    </Label>
                    <Input
                      id="delete-confirm"
                      value={deleteConfirmationInput}
                      onChange={(e) =>
                        setDeleteConfirmationInput(e.target.value)
                      }
                      placeholder={deleteConfirmationPhrase}
                      className="border-destructive/50 focus:ring-destructive/50"
                    />
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={
                        deleteConfirmationInput !== deleteConfirmationPhrase
                      }
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Vision
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <p className="text-lg text-muted-foreground max-w-3xl mb-6">
            {vision.goal}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RoadmapDisplay
              roadmap={roadmap}
              roadmapRef={roadmapRef}
              onRegenerateSection={handleRegenerateSection}
            />
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="text-primary" />
                  AI Coach
                </CardTitle>
                <CardDescription>
                  Check in on your progress, share wins or problems, and get a
                  strategic briefing.
                  {!plan?.aiFeaturesEnabled && (
                    <Badge variant="destructive" className="ml-2">
                      Requires Pathfinder Plan or higher
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="What's on your mind? e.g., 'I completed the certification for my monthly sprint!' or 'I'm struggling to find time for my daily habits.'"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="min-h-[120px]"
                    disabled={!plan?.aiFeaturesEnabled}
                  />
                  <Button
                    onClick={handleReflection}
                    disabled={
                      isReflecting || !userInput || !plan?.aiFeaturesEnabled
                    }
                    className="w-full"
                  >
                    {isReflecting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        Getting Reflection...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2" />
                        Get Reflection
                      </>
                    )}
                  </Button>
                  {reflection && (
                    <Alert className="mt-4">
                      <AlertTitle>Strategic Briefing</AlertTitle>
                      <AlertDescription className="whitespace-pre-wrap font-sans">
                        {reflection}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={isShareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Vision</DialogTitle>
            <DialogDescription>
              Make your vision public to share it with others. They will only be
              able to see your vision and yearly milestones.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="public-switch"
                checked={vision.isPublic}
                onCheckedChange={handleIsPublicChange}
              />
              <Label htmlFor="public-switch">Make this vision public</Label>
            </div>
            {vision.isPublic && (
              <div className="space-y-2">
                <Label htmlFor="share-link">Shareable Link</Label>
                <div className="flex gap-2">
                  <Input id="share-link" value={shareUrl} readOnly />
                  <Button
                    size="icon"
                    onClick={copyToClipboard}
                    variant="outline"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRefocusModalOpen} onOpenChange={setRefocusModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Refocus & Regenerate Roadmap</DialogTitle>
            <DialogDescription>
              Provide focus areas for the AI to generate a more tailored
              roadmap. Completed tasks will be remembered.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {(sectionToRegenerate === "all" ||
              sectionToRegenerate === "visionTimeline") && (
              <div className="space-y-2">
                <Label>Timeline Focus</Label>
                <Textarea
                  placeholder="e.g., Establish the foundation, then scale."
                  value={timelineFocus}
                  onChange={(e) => setTimelineFocus(e.target.value)}
                />
              </div>
            )}
            {(sectionToRegenerate === "all" ||
              sectionToRegenerate === "yearlyMilestones") && (
              <div className="space-y-2">
                <Label>Yearly Focus</Label>
                <Textarea
                  placeholder="e.g., Secure major funding round."
                  value={yearlyFocus}
                  onChange={(e) => setYearlyFocus(e.target.value)}
                />
              </div>
            )}
            {(sectionToRegenerate === "all" ||
              sectionToRegenerate === "monthlySprints") && (
              <div className="space-y-2">
                <Label>Monthly Focus</Label>
                <Textarea
                  placeholder="e.g., Onboard first 100 paying customers."
                  value={monthlyFocus}
                  onChange={(e) => setMonthlyFocus(e.target.value)}
                />
              </div>
            )}
            {(sectionToRegenerate === "all" ||
              sectionToRegenerate === "weeklyTactics") && (
              <div className="space-y-2">
                <Label>Weekly Focus</Label>
                <Textarea
                  placeholder="e.g., Ship two new feature updates."
                  value={weeklyFocus}
                  onChange={(e) => setWeeklyFocus(e.target.value)}
                />
              </div>
            )}
            {(sectionToRegenerate === "all" ||
              sectionToRegenerate === "dailyHabits") && (
              <div className="space-y-2">
                <Label>Daily Focus</Label>
                <Textarea
                  placeholder="e.g., Stick to a consistent morning routine."
                  value={dailyFocus}
                  onChange={(e) => setDailyFocus(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRefocusModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegenerate} disabled={isRegenerating}>
              {isRegenerating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Regenerate with Focus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {proposedRoadmap && (
        <RoadmapSelectionDialog
          isOpen={!!proposedRoadmap}
          onOpenChange={(open) => !open && setProposedRoadmap(null)}
          proposedRoadmap={proposedRoadmap}
          onConfirm={handleConfirmRoadmap}
        />
      )}

      {vision && (
        <EditVisionDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          initialTitle={vision.title}
          initialCategory={vision.category || ""}
          onUpdate={handleUpdateVision}
        />
      )}

      {vision && (
        <FutureSelfChat
          userName={userData?.displayName || user?.displayName}
          visionTitle={vision.title}
          visionGoal={vision.goal}
        />
      )}
    </>
  );
}
