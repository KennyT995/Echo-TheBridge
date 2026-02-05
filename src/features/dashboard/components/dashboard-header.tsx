
import { Button } from "@/components/ui/button";
import {
    Mail,
    BookOpen,
    Compass,
    CalendarDays,
    Moon,
    PlusCircle,
    ArrowRight,
} from "lucide-react";

interface DashboardHeaderProps {
    isLoading: boolean;
    isLimitReached: boolean;
    isSunday: boolean;
    onOpenFutureLetter: () => void;
    onOpenJournal: () => void;
    onOpenDecision: () => void;
    onOpenWeeklyRetro: () => void;
    onOpenNightlyReview: () => void;
    onOpenCreateVision: () => void;
    onNavigateToPlans: () => void;
}

export function DashboardHeader({
    isLoading,
    isLimitReached,
    isSunday,
    onOpenFutureLetter,
    onOpenJournal,
    onOpenDecision,
    onOpenWeeklyRetro,
    onOpenNightlyReview,
    onOpenCreateVision,
    onNavigateToPlans,
}: DashboardHeaderProps) {
    return (
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
                    onClick={onOpenFutureLetter}
                    disabled={isLoading}
                    className="text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                    aria-label="Open Future Letter"
                >
                    <Mail className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    onClick={onOpenJournal}
                    disabled={isLoading}
                >
                    <BookOpen className="mr-2 h-4 w-4" /> Journal
                </Button>
                <Button
                    variant="outline"
                    onClick={onOpenDecision}
                    disabled={isLoading}
                    className="border-indigo-200 hover:bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                >
                    <Compass className="mr-2 h-4 w-4" /> Align
                </Button>
                {isSunday && (
                    <Button
                        variant="default"
                        onClick={onOpenWeeklyRetro}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 animate-pulse"
                    >
                        <CalendarDays className="mr-2 h-4 w-4" /> Weekly Review
                    </Button>
                )}
                <Button
                    variant="outline"
                    onClick={onOpenNightlyReview}
                    disabled={isLoading}
                    className="border-indigo-200 hover:bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                >
                    <Moon className="mr-2 h-4 w-4" /> End Day
                </Button>
                <Button
                    onClick={() =>
                        isLimitReached ? onNavigateToPlans() : onOpenCreateVision()
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
    );
}
