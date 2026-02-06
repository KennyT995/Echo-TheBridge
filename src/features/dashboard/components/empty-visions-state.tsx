
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
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-primary/20 rounded-[2.5rem] glass-card relative overflow-hidden animate-reveal">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />

            <div className="absolute inset-0 opacity-[0.02] rotate-12 pointer-events-none">
                <Compass className="w-[800px] h-[800px] absolute -top-40 -left-40" />
            </div>

            <div className="relative mb-10">
                <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-150 animate-pulse" />
                <div className="bg-background/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/10 relative animate-float">
                    <Sparkles className="h-10 w-10 text-primary" />
                </div>
            </div>

            <h3 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 font-headline text-center">
                Architect Your <span className="text-gradient">Future</span>
            </h3>
            <p className="text-lg text-muted-foreground/80 text-center max-w-sm mb-12 leading-relaxed font-light">
                You haven&apos;t defined any visions yet. Create your first strategic trajectory to bridge the gap between where you are and where you want to be.
            </p>
            <Button
                size="lg"
                onClick={() =>
                    isLimitReached ? onNavigateToPlans() : onOpenCreateVision()
                }
                disabled={isLoading}
                className="font-bold rounded-2xl h-14 px-10 text-lg shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95 animate-reveal delay-200"
            >
                {isLimitReached ? "Upgrade to Create More" : "Launch Your First Vision"}
                {isLimitReached ? (
                    <ArrowRight className="ml-2 h-5 w-5" />
                ) : (
                    <PlusCircle className="ml-2 h-5 w-5" />
                )}
            </Button>
        </div>
    );
}

