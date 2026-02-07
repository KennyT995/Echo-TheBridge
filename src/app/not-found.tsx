import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#050505] relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10" />

            <div className="max-w-xl w-full glass-card border-white/5 p-12 rounded-[3.5rem] text-center space-y-8 animate-reveal">
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-[2rem] border border-primary/20 flex items-center justify-center mb-8 group">
                    <Compass className="h-12 w-12 text-primary animate-pulse" />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 text-primary mb-2">
                        <div className="h-px w-8 bg-primary/20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Coordinates Invalid</span>
                        <div className="h-px w-8 bg-primary/20" />
                    </div>
                    <h1 className="font-headline text-5xl font-black tracking-tighter text-white">
                        Path <br /><span className="text-primary">Not Found</span>
                    </h1>
                    <p className="text-xl text-muted-foreground/60 font-light leading-relaxed max-w-sm mx-auto italic">
                        &quot;The bridge you seek has not yet been constructed.&quot;
                    </p>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                    <Button asChild size="lg" className="h-16 rounded-2xl bg-white text-black hover:bg-white/90 font-black text-xl uppercase tracking-widest shadow-2xl transition-all active:scale-95 group">
                        <Link href="/">
                            <Home className="mr-3 h-5 w-5 group-hover:-translate-y-1 transition-transform duration-300" />
                            Return to Nexus
                        </Link>
                    </Button>
                </div>
            </div>

            <p className="absolute bottom-12 text-[10px] text-muted-foreground/20 font-black uppercase tracking-[0.4em]">
                Echo: The Bridge // Navigation System Valid
            </p>
        </div>
    );
}
