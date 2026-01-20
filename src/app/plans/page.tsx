'use client';

import { useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useFirestore, useUser } from '@/firebase';

import { collection, doc, writeBatch, getDoc } from 'firebase/firestore';
import { Loader2, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getStripe } from '@/lib/stripe';
import type { PlanTier, UserData } from '@/lib/types';
import { getErrorMessage } from '@/lib/error-utils';


const defaultPlans: PlanTier[] = [
  {
    id: 'trailblazer',
    name: 'Trailblazer',
    price: 0,
    maxVisions: 1,
    aiFeaturesEnabled: false,
    features: ['1 Vision', 'Basic Roadmap Generation', 'Community Support'],
    stripePriceId: null
  },
  {
    id: 'pathfinder',
    name: 'Pathfinder',
    price: 15,
    maxVisions: 5,
    aiFeaturesEnabled: true,
    features: [
      '5 Visions',
      'Advanced AI-Powered Roadmap',
      'AI-Powered Strategic Briefings',
      'Email Support',
    ],
    stripePriceId: 'price_1PXZEkRUD5S9xH2g8aXQY9aZ' // Replace with your actual Stripe Price ID
  },
  {
    id: 'visionary',
    name: 'Visionary',
    price: 45,
    maxVisions: 999, // Effectively unlimited
    aiFeaturesEnabled: true,
    features: [
      'Unlimited Visions',
      'Advanced AI-Powered Roadmap',
      'AI-Powered Strategic Briefings',
      'Priority Support',
      'Legacy Planning',
    ],
    stripePriceId: 'price_1PXZFjRUD5S9xH2gX3eZ4w5A' // Replace with your actual Stripe Price ID
  },
];

async function seedDefaultPlans(db: any) {
  const plansRef = collection(db, 'plan_tiers');
  // Check if plans already exist to avoid overwriting
  const snapshot = await getDoc(doc(plansRef, defaultPlans[0].id));
  if (!snapshot.exists()) {
    const batch = writeBatch(db);
    defaultPlans.forEach((plan) => {
      const docRef = doc(plansRef, plan.id);
      batch.set(docRef, plan);
    });
    await batch.commit();

  }
}



export default function PlansPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const plansQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'plan_tiers');
  }, [firestore]);

  const { data: plans, isLoading: plansLoading } = useCollection<PlanTier>(plansQuery);

  useEffect(() => {
    async function handleSeeding() {
      if (firestore && !plansLoading) {
        if (!plans || plans.length === 0) {
          try {
            await seedDefaultPlans(firestore);
            // This might require a manual refresh or a state change to re-trigger useCollection
          } catch (e) {
            console.error("Error seeding plans:", e);
          }
        }
        setIsSeeding(false);
      }
    }
    handleSeeding();
  }, [firestore, plans, plansLoading]);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userData } = useDoc<UserData>(userDocRef);

  const handleSelectPlan = async (plan: PlanTier) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsProcessing(true);

    // Free plan, just update firestore
    if (plan.price === 0 && userDocRef) {
      try {
        const { setDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
        setDocumentNonBlocking(userDocRef, { planTierId: plan.id }, { merge: true });
        toast({
          title: "Plan Updated!",
          description: "Your plan has been successfully updated to Trailblazer.",
        });
        router.push('/dashboard');
      } catch (error) {
        console.error("Error updating to free plan: ", error);
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Could not update your plan. Please try again.",
        });
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Paid plan, create checkout session
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error.message || 'Failed to create checkout session.');
      }

      const { sessionId } = await response.json();
      const stripe = await getStripe();
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          throw error;
        }
      } else {
        throw new Error('Stripe.js is not loaded.');
      }
    } catch (error: unknown) {
      console.error('Error handling subscription:', error);
      toast({
        title: "Subscription Error",
        description: getErrorMessage(error),
        variant: "destructive"
      });
      setIsProcessing(false);
    }
    // No need to set isProcessing(false) here, as the user is redirected.
  };

  const handleManageBilling = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      const { url } = await response.json();
      window.location.assign(url);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not open billing management. Please try again.",
      });
      setIsProcessing(false);
    }
  };


  if (plansLoading || isSeeding) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const displayedPlans = plans && plans.length > 0 ? plans : defaultPlans;

  const currentPlan = displayedPlans.find(p => p.id === userData?.planTierId);

  return (
    <>
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Select the plan that best fits your journey.
          </p>
        </div>

        {currentPlan && currentPlan.price > 0 && (
          <div className="mt-8 text-center">
            <Button onClick={handleManageBilling} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
              Manage Billing & Subscription
            </Button>
          </div>
        )}

        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          {displayedPlans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'flex flex-col border-border/50',
                userData?.planTierId === plan.id && 'border-primary ring-2 ring-primary'
              )}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">${plan.price}</span>
                  {plan.price > 0 && <span className="text-sm text-muted-foreground">/month</span>}
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
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isProcessing || (!!user && userData?.planTierId === plan.id && plan.id !== 'trailblazer')}
                >
                  {isProcessing && <Loader2 className="mr-2 animate-spin" />}
                  {user && userData?.planTierId === plan.id ? 'Current Plan' : 'Select Plan'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
