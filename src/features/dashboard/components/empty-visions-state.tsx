
import { Button } from "@/components/ui/button";
import { Compass, Sparkles, ArrowRight, PlusCircle } from "lucide-react";

interface EmptyVisionsStateProps {
    isLoading: boolean;
    isLimitReached: boolean;
    onOpenCreateVision: () => void;
    onNavigateToPlans: () => void;
}

export function EmptyVisionsState({
    isLoading,
    isLimitReached,
    onOpenCreateVision,
    onNavigateToPlans,
}: EmptyVisionsStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border/60 rounded-2xl bg-muted/5 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] scale-150 -rotate-12 pointer-events-none">
                <Compass className="w-full h-full" />
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
                <div className="bg-background p-5 rounded-2xl shadow-xl border border-border/50 relative">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
            </div>

            <h3 className="text-2xl font-bold tracking-tight mb-2 font-headline">
                Architect Your Future
            </h3>
            <p className="text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">
                You haven&apos;t defined any visions yet. Create your first strategic trajectory to bridge the gap between where you are and where you want to be.
            </p>
            <Button
                size="lg"
                onClick={() =>
                    isLimitReached ? onNavigateToPlans() : onOpenCreateVision()
                }
                disabled={isLoading}
                className="font-bold rounded-xl h-12 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95"
            >
                {isLimitReached ? "Upgrade to Create More" : "Launch Your First Vision"}
                {isLimitReached ? (
                    <ArrowRight className="ml-2 h-4 w-4" />
                ) : (
                    <PlusCircle className="ml-2 h-4 w-4" />
                )}
            </Button>
        </div>
    );
}
