'use client';

import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Loading from '../loading';

import { Button } from '@/components/ui/button';
import { PlusCircle, Eye, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import type { Vision, Roadmap, UserData, PlanTier } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { VisionForm } from '@/features/visions/components/vision-form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { VisionCharts } from '@/features/dashboard/components/vision-charts';

function usePlan(userData: UserData | null | undefined) {
    const firestore = useFirestore();

    const planRef = useMemoFirebase(() => {
        if (!firestore || !userData?.planTierId) return null;
        return doc(firestore, 'plan_tiers', userData.planTierId);
    }, [userData, firestore]);

    const { data: planData, isLoading: isPlanLoading } = useDoc<PlanTier>(planRef);

    return { plan: planData, isPlanLoading };
}


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateVisionOpen, setCreateVisionOpen] = useState(false);

  const visionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'visions'),
      orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);
  const roadmapsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'roadmaps');
  }, [user, firestore]);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);


  const { data: visions, isLoading: visionsLoading } = useCollection<Vision>(visionsQuery);
  const { data: roadmaps, isLoading: roadmapsLoading } = useCollection<Roadmap>(roadmapsQuery);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userDocRef);
  const { plan, isPlanLoading } = usePlan(userData);


  const roadmapsById = useMemo(() => {
    return roadmaps?.reduce((acc, roadmap) => {
        acc[roadmap.id] = roadmap;
        return acc;
    }, {} as Record<string, Roadmap>) || {};
}, [roadmaps]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const onVisionCreated = (visionId: string) => {
    setCreateVisionOpen(false);
    toast({
      title: "Success!",
      description: "Your new vision and roadmap have been created.",
    });
    router.push(`/vision/${visionId}`);
  };

  const isLoading = isUserLoading || visionsLoading || roadmapsLoading || isUserDataLoading || isPlanLoading;

  if (isLoading || !user) {
    return <Loading />;
  }

  const visionCount = visions?.length ?? 0;
  const visionLimit = plan?.maxVisions ?? 0;
  const isLimitReached = visionCount >= visionLimit;


  const renderVisionsSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded mt-2" />
          </CardContent>
          <div className="p-6 pt-0">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              An overview of your life's aspirations.
            </p>
          </div>
           <Button onClick={() => isLimitReached ? router.push('/plans') : setCreateVisionOpen(true)} disabled={isLoading}>
            {isLimitReached ? 'Vision Limit Reached' : 'New Vision'}
            {isLimitReached ? <ArrowRight className="ml-2" /> : <PlusCircle className="ml-2" />}
          </Button>
        </div>

        {isLoading ? (
          <div className='space-y-8'>
            <Skeleton className="h-64 w-full" />
            {renderVisionsSkeletons()}
          </div>
        ) : (
          <>
            <VisionCharts visions={visions || []} roadmaps={roadmapsById} />

            <h2 className="text-2xl font-bold tracking-tighter mt-12 mb-6">Your Visions</h2>
            {visions && visions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visions.map((vision) => (
                  <Card key={vision.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle>{vision.title}</CardTitle>
                      <CardDescription>
                        Created{' '}
                        {vision.createdAt
                          ? formatDistanceToNow((vision.createdAt as any).toDate(), { addSuffix: true })
                          : 'just now'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {vision.goal || 'No goal description provided.'}
                      </p>
                    </CardContent>
                    <div className="p-6 pt-0">
                      <Button asChild className="w-full">
                        <Link href={`/vision/${vision.id}`}>
                          <Eye className="mr-2" /> View Vision
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <Zap className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Visions Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start by creating a new vision for your future.
                </p>
                <Button className="mt-6" onClick={() => setCreateVisionOpen(true)} disabled={isLoading || isLimitReached}>
                    {isLimitReached ? 'Upgrade to Create More' : 'Create Your First Vision'}
                    {isLimitReached ? <ArrowRight className="ml-2" /> : <PlusCircle className="ml-2" />}
                </Button>
              </div>
            )}
          </>
        )}

        <Dialog open={isCreateVisionOpen} onOpenChange={setCreateVisionOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create a New Vision</DialogTitle>
              <DialogDescription>
                Define your future. We'll architect the path.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[80vh] overflow-y-auto p-1">
              <VisionForm onVisionCreated={onVisionCreated} />
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
