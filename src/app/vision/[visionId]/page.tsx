
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import Loading from '@/app/loading';

import { doc } from 'firebase/firestore';
import type { Vision, Roadmap, PlanTier, UserData } from '@/lib/types';
import { RoadmapDisplay } from '@/features/roadmaps/components/roadmap-display';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Trash2 } from 'lucide-react';
import { getReflection } from '@/app/actions';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

function usePlan(userData: UserData | null) {
    const firestore = useFirestore();

    const planRef = useMemoFirebase(() => {
        if (!userData?.planTierId) return null;
        return doc(firestore, 'plan_tiers', userData.planTierId);
    }, [userData, firestore]);

    const { data: planData, isLoading: isPlanLoading } = useDoc<PlanTier>(planRef);

    return { plan: planData, isPlanLoading };
}

export default function VisionDetailPage() {
  const { visionId } = useParams();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [userInput, setUserInput] = useState('');
  const [reflection, setReflection] = useState('');
  const [isReflecting, setIsReflecting] = useState(false);

  // Memoize Firestore references
  const visionRef = useMemoFirebase(() => {
    if (!user || !visionId) return null;
    return doc(firestore, 'users', user.uid, 'visions', visionId as string);
  }, [user, visionId, firestore]);

  const roadmapRef = useMemoFirebase(() => {
    if (!user || !visionId) return null;
    return doc(firestore, 'users', user.uid, 'roadmaps', visionId as string);
  }, [user, visionId, firestore]);

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: vision, isLoading: isVisionLoading } = useDoc<Vision>(visionRef);
  const { data: roadmap, isLoading: isRoadmapLoading } = useDoc<Roadmap>(roadmapRef);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userRef);

  // Conditionally fetch the plan only when userData is available
  const { plan, isPlanLoading } = usePlan(userData);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleReflection = async () => {
    if (!vision || !plan?.aiFeaturesEnabled) return;

    setIsReflecting(true);
    setReflection('');
    const visionString = `Title: ${vision.title}\nGoal: ${vision.goal}`;
    const result = await getReflection(userInput, visionString);
    if (result.strategicBriefing) {
      setReflection(result.strategicBriefing);
    }
    setIsReflecting(false);
  };

  const handleDelete = () => {
    if (visionRef && roadmapRef) {
      deleteDocumentNonBlocking(visionRef);
      deleteDocumentNonBlocking(roadmapRef);
      toast({
        title: "Vision Deleted",
        description: "Your vision has been removed.",
      });
      router.push('/dashboard');
    }
  };

  const isLoading = isUserLoading || isVisionLoading || isRoadmapLoading || isUserDataLoading || isPlanLoading;

  if (isLoading || !user) {
    return <Loading />;
  }
  
  // Skeleton State
  if (isVisionLoading || isRoadmapLoading || !vision || !roadmap) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 space-y-4">
          <Skeleton className="h-12 w-3/4 max-w-2xl" />
          <Skeleton className="h-6 w-1/2 max-w-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
          <div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary sm:text-5xl">
              {vision.title}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Your dynamically generated path to achieving your vision.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your vision and its roadmap from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Vision
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RoadmapDisplay roadmap={roadmap} roadmapRef={roadmapRef} />
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="text-primary" />
                  AI Coach
                </CardTitle>
                <CardDescription>
                  Check in on your progress, share wins or problems, and get a strategic briefing.
                  {!plan?.aiFeaturesEnabled && <Badge variant="destructive" className="ml-2">Requires Pathfinder Plan or higher</Badge>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="What's on your mind? e.g., 'I completed the certification for my monthly sprint!' or 'I'm struggling to find time for my daily habits.'"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="min-h-[120px]"
                    disabled={!plan?.aiFeaturesEnabled}
                  />
                  <Button onClick={handleReflection} disabled={isReflecting || !userInput || !plan?.aiFeaturesEnabled} className="w-full">
                    {isReflecting ? (
                      <Loader2 className="animate-spin mr-2" />
                    ) : (
                      <Wand2 className="mr-2" />
                    )}
                    Get Reflection
                  </Button>
                  {reflection && (
                    <Alert className="mt-4">
                      <AlertTitle>Strategic Briefing</AlertTitle>
                      <AlertDescription className="whitespace-pre-wrap font-sans">
                        {reflection}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
