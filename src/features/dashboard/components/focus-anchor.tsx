"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Minimize2, Crosshair, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface FocusAnchorProps {
  activeTask?: string;
  visionTitle?: string;
  onClose: () => void;
}

export function FocusAnchor({
  activeTask,
  visionTitle,
  onClose,
}: FocusAnchorProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const pathname = usePathname();

  // Don't show on login/register pages
  if (
    pathname?.includes("/login") ||
    pathname?.includes("/register") ||
    pathname?.includes("/share")
  ) {
    return null;
  }

  if (!activeTask) return null;

  return (
    <div
      className={cn(
        "fixed z-40 transition-all duration-500 ease-in-out font-sans animate-in slide-in-from-right-10",
        isMinimized ? "top-24 right-4" : "top-24 right-6",
      )}
    >
      <Card
        className={cn(
          "shadow-[0_0_30px_rgba(0,0,0,0.3)] border-indigo-500/20 bg-[#050505]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050505]/60 transition-all duration-300",
          isMinimized
            ? "w-12 h-12 rounded-full flex items-center justify-center p-0 border-indigo-500/40"
            : "w-80 p-0 overflow-hidden rounded-2xl border-indigo-500/30"
        )}
      >
        {isMinimized ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(false)}
            className="h-full w-full rounded-full hover:bg-indigo-500/20 text-indigo-400 p-0 relative group"
          >
            <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping opacity-20" />
            <Target className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </Button>
        ) : (
          <div className="relative">
            {/* Header / Draggable Area */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient" />

            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                    <Crosshair className="w-3 h-3 text-indigo-400 animate-spin-slow" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                    Active Directive
                  </span>
                </div>
                <div className="flex gap-1 -mr-2 -mt-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-white"
                    onClick={() => setIsMinimized(true)}
                  >
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-white hover:bg-destructive/20"
                    onClick={onClose}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-base text-white/90 leading-snug drop-shadow-sm">
                  {activeTask}
                </h4>
                {visionTitle && (
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground/60 font-mono">
                    <span className="w-1 h-1 rounded-full bg-indigo-500" />
                    <span className="truncate max-w-[200px]">{visionTitle}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
