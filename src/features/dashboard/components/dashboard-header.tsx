
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

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 animate-reveal">
            <div className="space-y-2">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tighter font-headline">
                    Architect&apos;s <span className="text-gradient">Dashboard</span>
                </h1>
                <p className="text-xl text-muted-foreground/60 font-light max-w-md">
                    Synchronize your daily actions with your multi-year strategic objectives.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <TooltipProvider>
                    <div className="flex items-center gap-2 p-1.5 rounded-2xl glass border-white/5 mr-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onOpenFutureLetter}
                                    disabled={isLoading}
                                    className="h-11 w-11 rounded-xl text-primary hover:bg-primary/10 transition-all hover:scale-110"
                                    aria-label="Open Future Letter"
                                >
                                    <Mail className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="glass-card border-primary/20 text-primary font-bold uppercase tracking-widest text-[10px]">
                                Signal from the Future
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onOpenJournal}
                                    disabled={isLoading}
                                    className="h-11 w-11 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
                                    aria-label="Open Journal"
                                >
                                    <BookOpen className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="glass-card border-white/20 text-white font-bold uppercase tracking-widest text-[10px]">
                                Strategic Reflection
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onOpenDecision}
                                    disabled={isLoading}
                                    className="h-11 w-11 rounded-xl text-accent hover:bg-accent/10 transition-all hover:scale-110"
                                    aria-label="Align Vision"
                                >
                                    <Compass className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="glass-card border-accent/20 text-accent font-bold uppercase tracking-widest text-[10px]">
                                Vision Alignment
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>

                <div className="flex items-center gap-3">
                    {isSunday && (
                        <Button
                            variant="default"
                            onClick={onOpenWeeklyRetro}
                            className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all animate-pulse"
                        >
                            <CalendarDays className="mr-2 h-5 w-5" /> Weekly Review
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        onClick={onOpenNightlyReview}
                        disabled={isLoading}
                        className="h-12 px-6 rounded-2xl glass border-white/10 font-bold hover:bg-white/5 transition-all"
                    >
                        <Moon className="mr-2 h-5 w-5" /> End Day
                    </Button>

                    <Button
                        onClick={() =>
                            isLimitReached ? onNavigateToPlans() : onOpenCreateVision()
                        }
                        disabled={isLoading}
                        className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 hover:scale-105 active:scale-95 transition-all shadow-2xl"
                    >
                        {isLimitReached ? "Upgrade" : "Initialize"}
                        {isLimitReached ? (
                            <ArrowRight className="ml-2 h-5 w-5" />
                        ) : (
                            <PlusCircle className="ml-2 h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

