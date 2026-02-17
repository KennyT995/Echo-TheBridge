"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share, MoreVertical, Smartphone, Monitor } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function InstallPrompt() {
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsStandalone(true);
    }

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios");
    } else if (/android/.test(userAgent)) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }
  }, []);

  if (isStandalone) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex items-center gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary hover:border-primary/40 rounded-full transition-all duration-500"
        >
          <Download className="h-4 w-4 animate-pulse" />
          <span className="text-xs uppercase tracking-widest font-bold">Install Protocol</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md glass-card border-white/10 bg-[#050505]/90 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 animate-float">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">System Integration</span>
          </div>
          <DialogTitle className="text-2xl font-headline font-bold tracking-tighter text-white">
            Initialize <span className="text-gradient">Echo Interface</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80 font-light text-base">
            Establish a direct neural link to your home screen for seamless, instant access to the Bridge.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6 border-t border-white/5 mt-2">
          {platform === "ios" && (
            <div className="flex flex-col gap-5 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-2.5 rounded-xl">
                  <Share className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Step 1: Access Share Menu</p>
                  <p className="text-xs text-muted-foreground mt-1">Tap the share icon in your browser toolbar.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-2.5 rounded-xl">
                  <span className="font-bold text-lg leading-none">+</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Step 2: Add to Home Screen</p>
                  <p className="text-xs text-muted-foreground mt-1">Scroll down and select the install option.</p>
                </div>
              </div>
            </div>
          )}

          {platform === "android" && (
            <div className="flex flex-col gap-5 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-2.5 rounded-xl">
                  <MoreVertical className="h-5 w-5 text-white/80" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Step 1: Open Menu</p>
                  <p className="text-xs text-muted-foreground mt-1">Tap the three dots in the top right corner.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-2.5 rounded-xl">
                  <Download className="h-5 w-5 text-white/80" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Step 2: Install App</p>
                  <p className="text-xs text-muted-foreground mt-1">Select 'Install App' or 'Add to Home Screen'.</p>
                </div>
              </div>
            </div>
          )}

          {platform === "desktop" && (
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group">
              <div className="bg-white/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Monitor className="h-6 w-6 text-white group-hover:text-primary transition-colors" />
              </div>
              <div className="text-sm text-muted-foreground/80 leading-relaxed">
                Locate the <Download className="inline h-3 w-3 mx-1 text-primary animate-bounce lg:animate-none" /> icon in your browser's address bar to install the desktop protocol.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
