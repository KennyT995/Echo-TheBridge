'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from '../loading';

import { Button } from '@/components/ui/button';
import { PlusCircle, Eye, Zap } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { collection, query, orderBy } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import type { Vision } from '@/lib/types';
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

  const { data: visions, isLoading: visionsLoading } = useCollection<Vision>(visionsQuery);

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

  if (isUserLoading || !user) {
    return <Loading />;
  }

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
              Your Visions
            </h1>
            <p className="text-muted-foreground mt-1">
              An overview of your life's aspirations.
            </p>
          </div>
          <Button onClick={() => setCreateVisionOpen(true)}>
            <PlusCircle className="mr-2" />
            New Vision
          </Button>
        </div>

        {visionsLoading && renderVisionsSkeletons()}

        {!visionsLoading && visions && visions.length > 0 && (
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
        )}

        {!visionsLoading && (!visions || visions.length === 0) && (
          <div className="text-center py-20 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <Zap className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Visions Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Start by creating a new vision for your future.
            </p>
            <Button className="mt-6" onClick={() => setCreateVisionOpen(true)}>
              <PlusCircle className="mr-2" />
              Create Your First Vision
            </Button>
          </div>
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
