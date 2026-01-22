'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Minimize2, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';
// import Draggable from 'react-draggable'; 
// But "Mini-Mode" implies moveable.
// Let's stick to a fixed bottom-right or bottom-center implementation first for simplicity and robustness.

interface FocusAnchorProps {
    activeTask?: string; // The current "next step" or focus
    visionTitle?: string;
    onClose: () => void;
}

export function FocusAnchor({ activeTask, visionTitle, onClose }: FocusAnchorProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const pathname = usePathname();

    // Don't show on login/register pages
    if (pathname?.includes('/login') || pathname?.includes('/register') || pathname?.includes('/share')) {
        return null;
    }

    if (!activeTask) return null;

    return (
        <div className={cn(
            "fixed z-50 transition-all duration-300 ease-in-out font-sans",
            isMinimized ? "bottom-4 right-4" : "bottom-6 right-6"
        )}>
            <Card className={cn(
                "shadow-2xl border-indigo-500/20 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60",
                isMinimized ? "w-12 h-12 rounded-full flex items-center justify-center p-0" : "w-80 p-4"
            )}>
                {isMinimized ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMinimized(false)}
                        className="h-full w-full rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500"
                    >
                        <Crosshair className="h-6 w-6" />
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 text-xs font-medium text-indigo-500 uppercase tracking-widest">
                                <Crosshair className="w-3 h-3" />
                                <span>Current Anchor</span>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(true)}>
                                    <Minimize2 className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={onClose}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg leading-tight">{activeTask}</h4>
                            {visionTitle && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    for {visionTitle}
                                </p>
                            )}
                        </div>

                        <div className="h-1 w-full bg-indigo-100 dark:bg-indigo-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-1/3 animate-pulse"></div>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
