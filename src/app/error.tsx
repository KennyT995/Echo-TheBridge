"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, RotateCcw, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#050505] relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-destructive/5 blur-[120px] rounded-full -z-10" />

            <div className="max-w-xl w-full glass-card border-white/5 p-12 rounded-[3.5rem] text-center space-y-8 animate-reveal">
                <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-[2rem] border border-destructive/20 flex items-center justify-center mb-8 group">
                    <AlertTriangle className="h-12 w-12 text-destructive animate-pulse" />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 text-destructive mb-2">
                        <div className="h-px w-8 bg-destructive/20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">System Failure</span>
                        <div className="h-px w-8 bg-destructive/20" />
                    </div>
                    <h1 className="font-headline text-5xl font-black tracking-tighter text-white">
                        Transmission <br /><span className="text-destructive">Interrupted</span>
                    </h1>
                    <p className="text-xl text-muted-foreground/60 font-light leading-relaxed max-w-sm mx-auto italic">
                        &quot;Even the most precise architectures encounter entropy.&quot;
                    </p>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                    <Button
                        onClick={() => reset()}
                        size="lg"
                        className="h-16 rounded-2xl bg-white text-black hover:bg-white/90 font-black text-xl uppercase tracking-widest shadow-2xl transition-all active:scale-95 group"
                    >
                        <RotateCcw className="mr-3 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                        Recalibrate
                    </Button>
                    <Button asChild variant="ghost" className="h-14 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all">
                        <Link href="/" className="flex items-center">
                            <Home className="mr-2 h-4 w-4" />
                            Return to Nexus
                        </Link>
                    </Button>
                </div>

                {process.env.NODE_ENV === "development" && (
                    <div className="mt-8 text-left">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive/40 mb-2 ml-4">Diagnostic Trace</div>
                        <pre className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl text-xs overflow-auto max-w-full font-mono text-destructive/80">
                            {error.message}
                        </pre>
                    </div>
                )}
            </div>

            <p className="absolute bottom-12 text-[10px] text-muted-foreground/20 font-black uppercase tracking-[0.4em]">
                Echo: The Bridge // Recovery Protocol Active
            </p>
        </div>
    );
}
