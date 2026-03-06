"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { VisionForm } from "@/features/visions/components/vision-form";
import { JournalDialog } from "@/features/journal/components/journal-dialog";
import { NightlyReviewDialog } from "@/features/journal/components/nightly-review-dialog";
import { DecisionDialog } from "@/features/journal/components/decision-dialog";
import { FutureLetterModal } from "@/features/dashboard/components/future-letter-modal";
import { CrossingCelebration } from "@/features/roadmaps/components/crossing-celebration";
import { WeeklyRetroDialog } from "@/features/journal/components/weekly-retro-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { GenerateFutureLetterOutput } from "@/ai/flows/generate-future-letter";

interface DashboardDialogsProps {
    isCreateVisionOpen: boolean;
    setCreateVisionOpen: (open: boolean) => void;
    onVisionCreated: (visionId: string) => void;

    visionToDelete: string | null;
    setVisionToDelete: (id: string | null) => void;
    isDeleting: boolean;
    deleteConfirmationInput: string;
    setDeleteConfirmationInput: (input: string) => void;
    deleteConfirmationPhrase: string;
    handleDeleteVision: () => void;

    isJournalOpen: boolean;
    setJournalOpen: (open: boolean) => void;

    isNightlyReviewOpen: boolean;
    setNightlyReviewOpen: (open: boolean) => void;

    isDecisionOpen: boolean;
    setDecisionOpen: (open: boolean) => void;
    activeVisions: string[];

    isFutureLetterOpen: boolean;
    setFutureLetterOpen: (open: boolean) => void;
    futureLetter: GenerateFutureLetterOutput | null;
    isGeneratingLetter: boolean;
    handleGenerateLetter: () => void;

    completedRoadmap: { id: string; visionTitle: string } | null;
    setCompletedRoadmap: (roadmap: { id: string; visionTitle: string } | null) => void;

    isWeeklyRetroOpen: boolean;
    setWeeklyRetroOpen: (open: boolean) => void;
}

export function DashboardDialogs({
    isCreateVisionOpen,
    setCreateVisionOpen,
    onVisionCreated,

    visionToDelete,
    setVisionToDelete,
    isDeleting,
    deleteConfirmationInput,
    setDeleteConfirmationInput,
    deleteConfirmationPhrase,
    handleDeleteVision,

    isJournalOpen,
    setJournalOpen,

    isNightlyReviewOpen,
    setNightlyReviewOpen,

    isDecisionOpen,
    setDecisionOpen,
    activeVisions,

    isFutureLetterOpen,
    setFutureLetterOpen,
    futureLetter,
    isGeneratingLetter,
    handleGenerateLetter,

    completedRoadmap,
    setCompletedRoadmap,

    isWeeklyRetroOpen,
    setWeeklyRetroOpen,
}: DashboardDialogsProps) {
    return (
        <>
            <Dialog open={isCreateVisionOpen} onOpenChange={setCreateVisionOpen}>
                <DialogContent className="max-w-4xl glass-card border-white/10 bg-[#050505]/90 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold font-headline tracking-tighter">Create a New Vision</DialogTitle>
                        <DialogDescription className="text-muted-foreground/60 font-light">
                            Define your future. We&apos;ll architect the path.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[80vh] overflow-y-auto p-1 custom-scrollbar">
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
                <AlertDialogContent className="glass-card border-white/10 bg-[#050505]/95 backdrop-blur-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-destructive flex items-center gap-2">
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground/80 font-light">
                            This action cannot be undone. This will permanently delete your
                            vision and its associated roadmap.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4 space-y-4">
                        <Label htmlFor="delete-confirm-dashboard" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                            To confirm, type:{" "}
                            <span className="font-mono text-primary/90 select-all underline underline-offset-4 decoration-primary/20">
                                &quot;{deleteConfirmationPhrase}&quot;
                            </span>
                        </Label>
                        <Input
                            id="delete-confirm-dashboard"
                            value={deleteConfirmationInput}
                            onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                            placeholder={deleteConfirmationPhrase}
                            className="h-12 bg-white/5 border-white/10 text-white focus-visible:ring-destructive/50 rounded-xl"
                            autoFocus
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting} className="rounded-xl border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteVision();
                            }}
                            disabled={
                                isDeleting ||
                                deleteConfirmationInput !== deleteConfirmationPhrase
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl px-6 font-bold"
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
                activeVisions={activeVisions}
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
        </>
    );
}
