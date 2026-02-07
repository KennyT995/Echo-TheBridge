"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";
import { Vision, Roadmap } from "@/lib/types";
import Loading from "@/app/loading";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  GanttChartSquare,
  Rocket,
  ShieldAlert,
  CircleDot,
  Flag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BridgeVisualizer } from "@/features/roadmaps/components/bridge-visualizer";
import { calculateOverallProgress, cn } from "@/lib/utils";

// Since this is a public page, we can't use our standard hooks.
// We initialize a temporary client-side Firebase instance.
const { firestore } = initializeFirebase();

export default function SharePage() {
  const { userId, visionId } = useParams<{
    userId: string;
    visionId: string;
  }>();
  const [vision, setVision] = useState<Vision | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !visionId) {
      setError("User or Vision ID is missing from the URL.");
      setIsLoading(false);
      return;
    }

    const fetchSharedVision = async () => {
      setIsLoading(true);
      try {
        const visionRef = doc(firestore, `users/${userId}/visions/${visionId}`);
        const visionSnap = await getDoc(visionRef);

        if (!visionSnap.exists() || !visionSnap.data().isPublic) {
          throw new Error("This vision is not public or does not exist.");
        }
        setVision(visionSnap.data() as Vision);

        const roadmapRef = doc(
          firestore,
          `users/${userId}/roadmaps/${visionId}`,
        );
        const roadmapSnap = await getDoc(roadmapRef);

        if (roadmapSnap.exists()) {
          setRoadmap(roadmapSnap.data() as Roadmap);
        }

        setError(null);
      } catch (e: unknown) {
        console.error(e);
        const errorMessage =
          e instanceof Error ? e.message : "An unknown error occurred";
        setError(
          errorMessage ||
          "Failed to fetch vision data. The link may be incorrect or the vision may no longer be public.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedVision();
  }, [userId, visionId]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <main className="min-h-screen bg-[#050505] relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: "-2s" }} />

      <Card className="w-full max-w-4xl glass-card border-white/5 relative z-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <CardHeader className="text-center pt-12 pb-8">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 animate-reveal">
            <Rocket className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-5xl md:text-6xl font-headline font-black tracking-tighter animate-reveal">
            Echo <span className="text-gradient">Strategic Transmission</span>
          </CardTitle>
          <p className="text-muted-foreground/40 font-bold uppercase tracking-[0.4em] mt-4 animate-reveal">
            Sector-01 // Public Protocol
          </p>
        </CardHeader>

        <CardContent className="text-center space-y-12 px-8 md:px-16 pb-16">
          {error ? (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive-foreground rounded-2xl p-6">
              <ShieldAlert className="h-6 w-6" />
              <AlertTitle className="text-xl font-bold ml-2">Transmission Interrupted</AlertTitle>
              <AlertDescription className="text-lg opacity-80 mt-2">{error}</AlertDescription>
            </Alert>
          ) : vision ? (
            <div className="space-y-12 animate-reveal">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-primary">
                  Primary Objective
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                  {vision.title}
                </h2>
                <div className="relative max-w-2xl mx-auto">
                  <p className="text-xl md:text-2xl text-muted-foreground/60 font-light italic leading-relaxed">
                    &quot;{vision.goal}&quot;
                  </p>
                </div>
              </div>

              {roadmap && (
                <div className="space-y-12">
                  <div className="glass shadow-inner rounded-[2rem] p-8 md:p-12 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-primary/10">
                      <GanttChartSquare className="w-32 h-32 rotate-12" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-end mb-6">
                        <div className="text-left">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-2">Bridge Integrity</span>
                          <h3 className="text-4xl font-black font-headline tracking-tighter">
                            {Math.round(calculateOverallProgress(roadmap))}<span className="text-primary text-2xl">%</span>
                          </h3>
                        </div>
                        <div className="text-right hidden md:block">
                          <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">Manifestation Progress</span>
                        </div>
                      </div>
                      <BridgeVisualizer
                        progress={calculateOverallProgress(roadmap)}
                        className="h-24"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    {/* Yearly Milestones */}
                    {roadmap.yearlyMilestones.length > 0 && (
                      <div className="space-y-6 glass-card p-8 rounded-3xl border-white/5 hover:border-primary/20 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 group-hover:scale-110 transition-transform">
                            <GanttChartSquare className="h-6 w-6 text-indigo-400" />
                          </div>
                          <h4 className="text-xl font-bold tracking-tight text-indigo-300">Yearly Milestones</h4>
                        </div>
                        <ul className="space-y-4">
                          {roadmap.yearlyMilestones.slice(0, 4).map((item, idx) => (
                            <li key={idx} className="flex gap-4 items-start group/item">
                              <div className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all",
                                item.completed ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/5 text-muted-foreground/20 border border-white/10"
                              )}>
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                              <span className={cn(
                                "text-lg transition-all",
                                item.completed ? "line-through text-muted-foreground/40" : "text-white/80 group-hover/item:text-white"
                              )}>{item.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Vision Timeline */}
                    {roadmap.visionTimeline && roadmap.visionTimeline.length > 0 && (
                      <div className="space-y-6 glass-card p-8 rounded-3xl border-white/5 hover:border-emerald-500/20 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                            <Flag className="h-6 w-6 text-emerald-400" />
                          </div>
                          <h4 className="text-xl font-bold tracking-tight text-emerald-300">Phase Objectives</h4>
                        </div>
                        <ul className="space-y-4">
                          {roadmap.visionTimeline.slice(0, 4).map((item, idx) => (
                            <li key={idx} className="flex gap-4 items-start group/item">
                              <div className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all",
                                item.completed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-muted-foreground/20 border border-white/10"
                              )}>
                                <CircleDot className="h-4 w-4" />
                              </div>
                              <span className={cn(
                                "text-lg transition-all",
                                item.completed ? "line-through text-muted-foreground/40" : "text-white/80 group-hover/item:text-white"
                              )}>{item.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 text-base text-primary/60 font-light flex items-center justify-center gap-4">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                    <p>Live AI manifestation cycle currently in execution via Echo Protocol.</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className="pt-8 flex flex-col items-center gap-8 animate-reveal">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="text-center space-y-4">
              <p className="text-muted-foreground/60 text-lg">Inspired by this vision?</p>
              <Button asChild size="lg" className="h-16 px-12 rounded-2xl bg-white text-black hover:bg-white/90 font-black text-xl uppercase tracking-tighter shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-all">
                <Link href="/">Architect Your Future</Link>
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.4em]">
              Echo: The Bridge // Strategic Manifestation OS
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

