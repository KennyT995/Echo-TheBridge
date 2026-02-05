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
  CardDescription,
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
    <main className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <Rocket className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-3xl font-headline mt-4">
            A Shared Vision
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {error ? (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Could Not Load Vision</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : vision ? (
            <div className="space-y-8">
              <div className="space-y-2">
                <CardDescription className="text-2xl font-bold text-primary">
                  {vision.title}
                </CardDescription>
                <p className="text-muted-foreground max-w-prose mx-auto italic">
                  &quot;{vision.goal}&quot;
                </p>
              </div>

              {roadmap && (
                <div className="space-y-6">
                  <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Building the Bridge</span>
                      <span className="text-lg font-bold text-primary">
                        {Math.round(calculateOverallProgress(roadmap))}%
                      </span>
                    </div>
                    <BridgeVisualizer
                      progress={calculateOverallProgress(roadmap)}
                      className="h-16"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    {/* Yearly Milestones */}
                    {roadmap.yearlyMilestones.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                          <GanttChartSquare className="h-4 w-4" /> Yearly Focus
                        </h4>
                        <ul className="space-y-2">
                          {roadmap.yearlyMilestones.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-sm flex gap-2">
                              <CheckCircle2 className={cn("h-4 w-4 shrink-0 mt-0.5", item.completed ? "text-green-500" : "text-muted-foreground/30")} />
                              <span className={item.completed ? "line-through text-muted-foreground" : ""}>{item.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Vision Timeline */}
                    {roadmap.visionTimeline && roadmap.visionTimeline.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <Flag className="h-4 w-4" /> The Long Game
                        </h4>
                        <ul className="space-y-2">
                          {roadmap.visionTimeline.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-sm flex gap-2">
                              <CircleDot className={cn("h-4 w-4 shrink-0 mt-0.5", item.completed ? "text-emerald-500" : "text-muted-foreground/30")} />
                              <span className={item.completed ? "line-through text-muted-foreground" : ""}>{item.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg text-sm text-indigo-700 dark:text-indigo-300">
                    <p>This is a live roadmap generated by Echo&apos;s AI. The user is currently executing these steps to manifest their vision.</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
          <div className="pt-8 flex flex-col items-center gap-4">
            <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/">Architect Your Own Future</Link>
            </Button>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              Powered by Echo: The Bridge
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
