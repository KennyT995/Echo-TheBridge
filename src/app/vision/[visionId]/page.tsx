'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import Loading from '@/app/loading';

import { doc, updateDoc } from 'firebase/firestore';
import type { Vision, Roadmap, PlanTier, UserData, RoadmapItem } from '@/lib/types';
import { RoadmapDisplay } from '@/features/roadmaps/components/roadmap-display';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Trash2, Share2, Copy, RefreshCw } from 'lucide-react';
import { getReflection, generateRoadmap } from '@/app/actions';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
  } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';


function usePlan(userData: UserData | null | undefined) {
    const firestore = useFirestore();

    const planRef = useMemoFirebase(() => {
        if (!firestore || !userData?.planTierId) return null;
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
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const shareUrl = typeof window !== 'undefined' && user ? `${window.location.origin}/share/${user.uid}/${visionId}` : '';
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const deleteConfirmationPhrase = "I want to delete this vision";


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

  const handleRegenerate = async () => {
    if (!vision || !roadmapRef || !visionRef) return;
    setIsRegenerating(true);
  
    const result = await generateRoadmap({ title: vision.title, goal: vision.goal, category: vision.category, isPublic: vision.isPublic });
  
    if (result.error || !result.roadmap || !result.correctedGoal) {
      toast({
        variant: 'destructive',
        title: 'Error Regenerating Roadmap',
        description: result.error || 'An unknown error occurred.',
      });
      setIsRegenerating(false);
      return;
    }
  
    // Update the vision if the goal text was corrected by the AI
    if (vision.goal !== result.correctedGoal) {
      updateDocumentNonBlocking(visionRef, { goal: result.correctedGoal });
    }
  
    // Overwrite the existing roadmap with the newly generated tasks
    const newRoadmapData = {
      yearlyMilestones: result.roadmap.yearlyMilestones,
      monthlySprints: result.roadmap.monthlySprints,
      weeklyTactics: result.roadmap.weeklyTactics,
      dailyHabits: result.roadmap.dailyHabits,
    };
    updateDocumentNonBlocking(roadmapRef, newRoadmapData);
  
    toast({
      title: "Roadmap Regenerated!",
      description: "Your new set of tasks is ready.",
    });
  
    setIsRegenerating(false);
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

  const handleIsPublicChange = (isPublic: boolean) => {
    if (visionRef) {
      updateDocumentNonBlocking(visionRef, { isPublic });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Copied!', description: 'Share link copied to clipboard.' });
  };

  const calculateOverallProgress = (roadmap: Roadmap): number => {
    const allItems: RoadmapItem[] = [
      ...(roadmap.yearlyMilestones || []),
      ...(roadmap.monthlySprints || []),
      ...(roadmap.weeklyTactics || []),
      ...(roadmap.dailyHabits || []),
    ];

    if (allItems.length === 0) {
      return 0;
    }

    const completedItems = allItems.filter(item => item.completed).length;
    return (completedItems / allItems.length) * 100;
  };

  const isLoading = isUserLoading || isVisionLoading || isRoadmapLoading || isUserDataLoading || isPlanLoading;

  if (isLoading || !user) {
    return <Loading />;
  }
  
  if (isVisionLoading || isRoadmapLoading || !vision || !roadmap) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 space-y-4 flex justify-between items-start">
            <div className="space-y-4">
                <Skeleton className="h-12 w-3/4 max-w-2xl" />
                <Skeleton className="h-6 w-1/2 max-w-xl" />
            </div>
            <Skeleton className="h-10 w-10 rounded-md" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  const overallProgress = calculateOverallProgress(roadmap);

  return (
    <>
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary sm:text-5xl">
                {vision.title}
              </h1>
              <Badge variant="secondary" className="mt-2">{vision.category}</Badge>
            </div>
            <div className="flex gap-2 flex-shrink-0">
               <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={isRegenerating}>
                    {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Regenerate
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Regenerate Roadmap?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will replace your current roadmap with a new set of AI-generated tasks. Any progress on your existing tasks will be lost. Are you sure you want to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRegenerate}>
                      Yes, Regenerate
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="outline" onClick={() => setShareModalOpen(true)}>
                  <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <AlertDialog onOpenChange={() => setDeleteConfirmationInput('')}>
                  <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-5 w-5" />
                  </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This will permanently delete your vision and its entire roadmap. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-2 space-y-4">
                        <Label htmlFor="delete-confirm">To confirm, type: <span className="font-mono text-primary/90">"{deleteConfirmationPhrase}"</span></Label>
                        <Input 
                            id="delete-confirm"
                            value={deleteConfirmationInput}
                            onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                            placeholder={deleteConfirmationPhrase}
                            className="border-destructive/50 focus:ring-destructive/50"
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete} 
                            disabled={deleteConfirmationInput !== deleteConfirmationPhrase}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Vision
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-3xl mb-6">{vision.goal}</p>

          <div>
              <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Overall Vision Progress</span>
                  <span className="text-sm font-bold text-primary">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3 w-full" />
          </div>

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

       <Dialog open={isShareModalOpen} onOpenChange={setShareModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Your Vision</DialogTitle>
                    <DialogDescription>
                        Make your vision public to share it with others. They will only be able to see your vision and yearly milestones.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="flex items-center space-x-2">
                        <Switch id="public-switch" checked={vision.isPublic} onCheckedChange={handleIsPublicChange} />
                        <Label htmlFor="public-switch">Make this vision public</Label>
                    </div>
                    {vision.isPublic && (
                         <div className="space-y-2">
                            <Label htmlFor="share-link">Shareable Link</Label>
                            <div className="flex gap-2">
                                <Input id="share-link" value={shareUrl} readOnly />
                                <Button size="icon" onClick={copyToClipboard} variant="outline">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </>
  );
}
