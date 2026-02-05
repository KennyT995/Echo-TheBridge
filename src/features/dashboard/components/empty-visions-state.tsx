
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, PlusCircle } from "lucide-react";

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
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-muted rounded-xl bg-muted/10">
            <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                <Zap className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">
                No Visions Found
            </h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
                You haven&apos;t created any visions yet. Define your future to get a
                personalized roadmap and AI coaching.
            </p>
            <Button
                size="lg"
                onClick={() =>
                    isLimitReached ? onNavigateToPlans() : onOpenCreateVision()
                }
                disabled={isLoading}
                className="font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
            >
                {isLimitReached ? "Upgrade to Create More" : "Create Your First Vision"}
                {isLimitReached ? (
                    <ArrowRight className="ml-2 h-4 w-4" />
                ) : (
                    <PlusCircle className="ml-2 h-4 w-4" />
                )}
            </Button>
        </div>
    );
}
