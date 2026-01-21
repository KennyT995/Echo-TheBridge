import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Square, Timer, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface FocusTimerProps {
    habitName: string;
    durationMinutes?: number;
    onComplete?: () => void;
    className?: string;
    compact?: boolean;
}

export function FocusTimer({ habitName, durationMinutes = 25, onComplete, className, compact = false }: FocusTimerProps) {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const originalDuration = durationMinutes * 60;
    const progress = ((originalDuration - timeLeft) / originalDuration) * 100;

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleComplete();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const handleStart = () => setIsActive(true);
    const handlePause = () => setIsActive(false);

    const handleStop = () => {
        setIsActive(false);
        setTimeLeft(originalDuration);
        setIsCompleted(false);
    };

    const handleComplete = () => {
        setIsActive(false);
        setIsCompleted(true);
        toast({
            title: "Focus Session Complete! 🎉",
            description: `You focused on "${habitName}" for ${durationMinutes} minutes.`,
        });
        if (onComplete) onComplete();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isCompleted) {
        return (
            <Card className={cn("bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900", className)}>
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <div>
                            <p className="font-semibold text-green-700 dark:text-green-300">Session Complete</p>
                            <p className="text-sm text-muted-foreground">Great focus on "{habitName}"</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleStop}>
                        Reset
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (compact && !isActive && timeLeft === originalDuration) {
        return (
            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                onClick={handleStart}
                aria-label="Start focus timer"
            >
                <Timer className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <Card className={cn("overflow-hidden border-border", className)}>
            <CardContent className="p-0">
                {/* Progress Bar Background */}
                <div className="h-1 w-full bg-secondary overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className={cn("flex items-center justify-between", compact ? "p-1" : "p-4")}>
                    <div className={cn('flex items-center', compact ? "gap-2" : "gap-3")}>
                        <div className={cn(
                            "rounded-full",
                            compact ? "p-1.5" : "p-2",
                            isActive ? "bg-indigo-100 text-indigo-600 animate-pulse" : "bg-muted text-muted-foreground"
                        )}>
                            <Timer className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-mono text-xl font-bold leading-none">{formatTime(timeLeft)}</p>
                            {!compact && <p className="text-xs text-muted-foreground truncate max-w-[150px]">{habitName}</p>}
                        </div>
                    </div>

                    <div className="flex gap-1">
                        {!isActive ? (
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-green-100 hover:text-green-600" onClick={handleStart} aria-label="Start timer">
                                <Play className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-yellow-100 hover:text-yellow-600" onClick={handlePause} aria-label="Pause timer">
                                <Pause className="h-4 w-4" />
                            </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-100 hover:text-red-600" onClick={handleStop} aria-label="Stop timer">
                            <Square className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
