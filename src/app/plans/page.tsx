'use client';

import { useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useFirestore, useUser } from '@/firebase';
import Header from '@/components/header';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type PlanTier = {
  id: string;
  name: string;
  maxVisions: number;
  aiFeaturesEnabled: boolean;
  price: number;
  features: string[];
};

type UserData = {
    planTierId: string;
}

export default function PlansPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const plansQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'plan_tiers');
  }, [firestore]);

  const { data: plans, isLoading: plansLoading } = useCollection<PlanTier>(plansQuery);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userData } = useDoc<UserData>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSelectPlan = async (planTierId: string) => {
    if (userDocRef) {
      await updateDoc(userDocRef, { planTierId });
      router.push('/');
    }
  };

  if (isUserLoading || plansLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto min-h-screen px-4 py-12 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Select the plan that best fits your journey.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          {plans?.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'flex flex-col',
                userData?.planTierId === plan.id && 'border-primary ring-2 ring-primary'
              )}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">${plan.price}</span>/month
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-4">
                  {plan.features?.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={userData?.planTierId === plan.id}
                >
                  {userData?.planTierId === plan.id ? 'Current Plan' : 'Select Plan'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
