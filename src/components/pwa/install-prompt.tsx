"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share, MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function InstallPrompt() {
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">(
    "desktop",
  );
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
          className="hidden sm:flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Install App
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Install Echo: The Bridge</DialogTitle>
          <DialogDescription>
            Add this app to your home screen for the best experience.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {platform === "ios" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-md">
                  <Share className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-sm">
                  1. Tap the <strong>Share</strong> button in your browser menu.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-md">
                  <span className="font-bold text-lg">+</span>
                </div>
                <p className="text-sm">
                  2. Scroll down and tap <strong>Add to Home Screen</strong>.
                </p>
              </div>
            </div>
          )}

          {platform === "android" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-md">
                  <MoreVertical className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm">
                  1. Tap the <strong>Menu</strong> (three dots) icon.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-md">
                  <Download className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm">
                  2. Tap <strong>Install App</strong> or{" "}
                  <strong>Add to Home Screen</strong>.
                </p>
              </div>
            </div>
          )}

          {platform === "desktop" && (
            <div className="text-sm text-muted-foreground">
              To install on desktop, look for the install icon{" "}
              <Download className="inline h-3 w-3" /> in your address bar
              (Chrome/Edge).
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
