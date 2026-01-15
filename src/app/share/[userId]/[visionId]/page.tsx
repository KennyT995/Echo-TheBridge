'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, getDocs, collection, query, where, limit } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { Vision, Roadmap } from '@/lib/types';
import Loading from '@/app/loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, GanttChartSquare, Rocket, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Since this is a public page, we can't use our standard hooks.
// We initialize a temporary client-side Firebase instance.
const { firestore } = initializeFirebase();

export default function SharePage() {
    const { userId, visionId } = useParams<{ userId: string, visionId: string }>();
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

                const roadmapRef = doc(firestore, `users/${userId}/roadmaps/${visionId}`);
                const roadmapSnap = await getDoc(roadmapRef);

                if (roadmapSnap.exists()) {
                    setRoadmap(roadmapSnap.data() as Roadmap);
                }
                
                setError(null);
            } catch (e: any) {
                console.error(e);
                setError(e.message || "Failed to fetch vision data. The link may be incorrect or the vision may no longer be public.");
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
                    <CardTitle className="text-3xl font-headline mt-4">A Shared Vision</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    {error ? (
                         <Alert variant="destructive">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>Could Not Load Vision</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : vision ? (
                        <>
                            <CardDescription className="text-xl font-semibold">{vision.title}</CardDescription>
                            <p className="text-muted-foreground max-w-prose mx-auto">{vision.goal}</p>
                            {roadmap && roadmap.yearlyMilestones.length > 0 && (
                                <div className="pt-4 text-left">
                                    <h3 className="font-bold text-xl mb-4 flex items-center justify-center gap-2"><GanttChartSquare /> Yearly Milestones</h3>
                                    <ul className="space-y-3">
                                        {roadmap.yearlyMilestones.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3 bg-muted/20 p-3 rounded-lg">
                                                <CheckCircle2 className={`h-5 w-5 mt-1 flex-shrink-0 ${item.completed ? 'text-green-500' : 'text-muted-foreground/50'}`} />
                                                <span className={`${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : null}
                    <div className="pt-6">
                         <Button asChild>
                            <Link href="/">Create Your Own Vision with Echo: The Bridge</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
