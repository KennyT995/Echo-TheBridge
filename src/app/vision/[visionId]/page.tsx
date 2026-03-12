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
  GanttChartSquare,
  Sparkles,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EditVisionDialog } from "@/features/visions/components/edit-vision-dialog";
import { getReflection, generateRoadmap } from "@/app/actions";
import { useDeleteVision } from "@/features/visions/hooks/use-delete-vision";
import type { GenerateRoadmapFromVisionInput } from "@/ai/flows/generate-roadmap-from-vision";
import { RoadmapSelectionDialog } from "@/features/roadmaps/components/roadmap-selection-dialog";
import { RoadmapDisplay } from "@/features/roadmaps/components/roadmap-display";
import {
  Vision,
  Roadmap,
  UserData,
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
  updateDocumentNonBlocking,
} from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlan } from "@/hooks/use-plan";
import { BridgeVisualizer } from "@/features/roadmaps/components/bridge-visualizer";
import { calculateOverallProgress } from "@/lib/utils";
import { FirestorePaths } from "@/lib/firestore-paths";


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
  const { deleteVision, isDeleting } = useDeleteVision();
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
    return doc(firestore, FirestorePaths.vision(user.uid, visionId as string));
  }, [user, visionId, firestore]);

  const roadmapRef = useMemoFirebase(() => {
    if (!user || !visionId) return null;
    return doc(firestore, FirestorePaths.roadmap(user.uid, visionId as string));
  }, [user, visionId, firestore]);

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, FirestorePaths.user(user.uid));
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
      sectionToRegenerate: sectionToRegenerate,
      isPartialRegen: sectionToRegenerate !== "all",
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

  const handleDelete = async () => {
    if (!visionId || !user) return;

    const result = await deleteVision(user.uid, visionId as string);

    if (result.success) {
      toast({
        title: "Vision Deleted",
        description: "Your vision and its roadmap have been removed.",
      });
      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to delete vision.",
      });
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
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />

      <main className="container mx-auto px-6 py-12 relative z-10">
        {/* Header Section */}
        <div className="mb-16 animate-reveal">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                  {vision.category || "General Strategy"}
                </Badge>
                <div className="h-px w-12 bg-white/10" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                  Sector-01 // Strategic Asset
                </span>
              </div>
              <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85]">
                {vision.title}
              </h1>
              <p className="text-2xl md:text-3xl text-muted-foreground/60 font-light italic leading-relaxed max-w-3xl border-l-2 border-primary/20 pl-8 py-2">
                &quot;{vision.goal}&quot;
              </p>
            </div>

            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <Button
                variant="ghost"
                onClick={() => setIsEditDialogOpen(true)}
                className="h-14 px-8 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all text-lg font-bold"
              >
                <Pencil className="mr-3 h-5 w-5" /> Edit
              </Button>
              <Button
                variant="ghost"
                disabled={isRegenerating}
                onClick={() => {
                  setSectionToRegenerate("all");
                  setRefocusModalOpen(true);
                }}
                className="h-14 px-8 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all text-lg font-bold"
              >
                {isRegenerating ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-3 h-5 w-5" />
                )}
                Resynthesize
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShareModalOpen(true)}
                className="h-14 px-8 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-md hover:bg-primary/10 text-primary transition-all text-lg font-bold"
              >
                <Share2 className="mr-3 h-5 w-5" /> Share
              </Button>

              <AlertDialog onOpenChange={() => setDeleteConfirmationInput("")}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-14 w-14 rounded-2xl border border-destructive/10 bg-destructive/5 text-destructive hover:bg-destructive/20 transition-all"
                  >
                    <Trash2 className="h-6 w-6" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card border-white/5 bg-black/90 backdrop-blur-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-3xl font-headline font-bold tracking-tighter">
                      Terminate <span className="text-destructive">Vision</span>?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-lg font-light text-muted-foreground/60">
                      This will permanently purge the vision data and its entire manifestation trajectory. This action is irreversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="py-6 space-y-4">
                    <Label htmlFor="delete-confirm" className="text-sm font-bold uppercase tracking-widest text-muted-foreground/40">
                      Security Verification // Type:
                      <span className="text-white block mt-2 text-xl font-mono normal-case tracking-normal">
                        &quot;{deleteConfirmationPhrase}&quot;
                      </span>
                    </Label>
                    <Input
                      id="delete-confirm"
                      value={deleteConfirmationInput}
                      onChange={(e) =>
                        setDeleteConfirmationInput(e.target.value)
                      }
                      placeholder="Enter verification phrase..."
                      className="h-14 rounded-2xl bg-white/5 border-destructive/20 text-xl px-6 focus-visible:ring-destructive/40"
                    />
                  </div>

                  <AlertDialogFooter className="gap-4">
                    <AlertDialogCancel className="h-12 px-6 rounded-xl border-white/10 bg-white/5 text-muted-foreground">Abort</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={
                        deleteConfirmationInput !== deleteConfirmationPhrase ||
                        isDeleting
                      }
                      className="h-12 px-8 rounded-xl bg-destructive text-white font-bold hover:bg-destructive/90 transition-all"
                    >
                      {isDeleting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Confirm Deletion
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="glass shadow-inner rounded-[2.5rem] p-10 md:p-14 border border-white/5 relative overflow-hidden group max-w-4xl">
            <div className="absolute top-0 right-0 p-12 text-primary/5">
              <GanttChartSquare className="w-48 h-48 rotate-12" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-end mb-8">
                <div className="text-left space-y-2">
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-primary block">Structural Integrity Protocol</span>
                  <h3 className="text-6xl md:text-8xl font-black font-headline tracking-tighter leading-none">
                    {Math.round(calculateOverallProgress(roadmap))}<span className="text-primary text-4xl md:text-6xl">%</span>
                  </h3>
                </div>
              </div>
              <BridgeVisualizer
                progress={calculateOverallProgress(roadmap)}
                className="h-24"
              />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          <div className="xl:col-span-2 space-y-12">
            <RoadmapDisplay
              roadmap={roadmap}
              roadmapRef={roadmapRef}
              onRegenerateSection={handleRegenerateSection}
            />
          </div>

          <div className="space-y-8">
            <Card className="glass-card border-white/5 shadow-2xl overflow-hidden rounded-[2.5rem]">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <CardHeader className="p-10 pb-6">
                <div className="flex items-center gap-4 text-primary mb-2">
                  <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                    <Wand2 className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.4em]">Neural Coach</span>
                </div>
                <CardTitle className="text-4xl font-headline font-bold tracking-tighter">
                  Strategic <span className="text-gradient">Calibration</span>
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground/60 font-light pt-2 leading-relaxed">
                  Synthesize your daily progress or obstacles into actionable neural feedback.
                  {!plan?.aiFeaturesEnabled && (
                    <Badge variant="destructive" className="mt-4 block w-fit">
                      Requires Pathfinder Protocol
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-10 pt-0 space-y-8">
                <Textarea
                  placeholder="Transmit your current state... e.g., 'Completed the certification phase ahead of schedule.'"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="min-h-[200px] rounded-3xl glass border-white/10 text-xl px-8 py-6 focus-visible:ring-primary/40 bg-white/5 font-light leading-relaxed resize-none"
                  disabled={!plan?.aiFeaturesEnabled}
                />

                <Button
                  onClick={handleReflection}
                  disabled={isReflecting || !userInput.trim() || !plan?.aiFeaturesEnabled}
                  className="w-full h-16 rounded-2xl bg-white text-black hover:bg-white/90 font-black text-xl uppercase tracking-widest shadow-xl transition-all active:scale-95 group"
                >
                  {isReflecting ? (
                    <>
                      <Loader2 className="animate-spin h-6 w-6 mr-3" />
                      Analyzing Transmsission...
                    </>
                  ) : (
                    <>
                      Execute Calibration <Sparkles className="ml-3 h-6 w-6 group-hover:scale-125 transition-transform" />
                    </>
                  )}
                </Button>

                {reflection && (
                  <div className="mt-8 animate-reveal">
                    <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 text-primary/10">
                        <Wand2 className="w-12 h-12" />
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary">Strategic Response</h4>
                      <p className="text-lg text-white/90 font-light leading-relaxed whitespace-pre-wrap">
                        {reflection}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legend/Info for Architecture */}
            <div className="p-10 rounded-[2.5rem] bg-indigo-500/[0.03] border border-indigo-500/10 space-y-6">
              <div className="flex items-center gap-3">
                <Flag className="w-5 h-5 text-indigo-400 opacity-40" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Architecture Metadata</span>
              </div>
              <p className="text-sm text-muted-foreground/60 leading-relaxed font-light italic">
                All objectives are synthesized via the Echo Generative Protocol. Your trajectory is currently active and monitoring for manifestation triggers.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isShareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="glass-card border-white/5 bg-black/90 backdrop-blur-2xl">
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
        <DialogContent className="max-w-2xl glass-card border-white/5 bg-black/90 backdrop-blur-2xl">
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
          key={proposedRoadmap.id}
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
          aiFeaturesEnabled={plan?.aiFeaturesEnabled ?? false}
        />
      )}
    </div>
  );
}
