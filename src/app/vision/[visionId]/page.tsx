'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import Loading from '@/app/loading';
import Header from '@/components/header';
import { doc } from 'firebase/firestore';
import type { Vision, Roadmap, PlanTier, UserData } from '@/lib/types';
import { RoadmapDisplay } from '@/components/roadmap-display';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2 } from 'lucide-react';
import { getReflection } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function VisionDetailPage() {
  const { visionId } = useParams();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

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
  const { data: userData } = useDoc<UserData>(userRef);

  const planRef = useMemoFirebase(() => {
    if (!userData) return null;
    return doc(firestore, 'plan_tiers', userData.planTierId);
  }, [userData, firestore]);

  const { data: plan } = useDoc<PlanTier>(planRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleReflection = async () => {
    if (!vision || !plan?.aiFeaturesEnabled) return;

    setIsReflecting(true);
    setReflection('');
    const visionString = JSON.stringify(vision);
    const result = await getReflection(userInput, visionString);
    if (result.strategicBriefing) {
      setReflection(result.strategicBriefing);
    }
    setIsReflecting(false);
  };

  if (isUserLoading || isVisionLoading || isRoadmapLoading || !user || !vision || !roadmap) {
    return <Loading />;
  }

  const getCombinedVisionText = () => {
      if (!vision) return '';
      let text = '';
      text += `Title: ${vision.title}\n\n`;
      text += `2 Year Career: ${vision.twoYearVision.career}\n`;
      text += `5 Year Career: ${vision.fiveYearVision.career}\n`;
      text += `10 Year Career: ${vision.tenYearVision.career}\n`;
      return text;
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary sm:text-5xl">
                {vision.title}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Your dynamically generated path to achieving your vision.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <RoadmapDisplay roadmap={roadmap} />
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wand2 className="text-primary"/>
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
