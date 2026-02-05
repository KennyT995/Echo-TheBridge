"use client";

import { useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { useFirestore, useUser } from "@/firebase";

import { collection, doc, writeBatch, getDoc } from "firebase/firestore";
import { Loader2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getStripe } from "@/lib/stripe";
import type { PlanTier, UserData } from "@/lib/types";
import { getErrorMessage } from "@/lib/error-utils";

const defaultPlans: PlanTier[] = [
  {
    id: "trailblazer",
    name: "Trailblazer",
    price: 0,
    maxVisions: 1,
    aiFeaturesEnabled: false,
    features: ["1 Vision", "Basic Roadmap Generation", "Community Support"],
    stripePriceId: null,
  },
  {
    id: "pathfinder",
    name: "Pathfinder",
    price: 15,
    maxVisions: 5,
    aiFeaturesEnabled: true,
    features: [
      "5 Visions",
      "Advanced AI-Powered Roadmap",
      "AI-Powered Strategic Briefings",
      "Email Support",
    ],
    stripePriceId: "price_1PXZEkRUD5S9xH2g8aXQY9aZ", // Replace with your actual Stripe Price ID
  },
  {
    id: "visionary",
    name: "Visionary",
    price: 45,
    maxVisions: 999, // Effectively unlimited
    aiFeaturesEnabled: true,
    features: [
      "Unlimited Visions",
      "Advanced AI-Powered Roadmap",
      "AI-Powered Strategic Briefings",
      "Priority Support",
      "Legacy Planning",
    ],
    stripePriceId: "price_1PXZFjRUD5S9xH2gX3eZ4w5A", // Replace with your actual Stripe Price ID
  },
];

import { Firestore } from "firebase/firestore";

async function seedDefaultPlans(db: Firestore) {
  const plansRef = collection(db, "plan_tiers");
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
    return collection(firestore, "plan_tiers");
  }, [firestore]);

  const { data: plans, isLoading: plansLoading } =
    useCollection<PlanTier>(plansQuery);

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
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);
  const { data: userData } = useDoc<UserData>(userDocRef);

  const handleSelectPlan = async (plan: PlanTier) => {
    if (!user) {
      router.push("/login");
      return;
    }
    setIsProcessing(true);

    // Free plan, just update firestore
    if (plan.price === 0 && userDocRef) {
      try {
        const { setDocumentNonBlocking } =
          await import("@/firebase/non-blocking-updates");
        setDocumentNonBlocking(
          userDocRef,
          { planTierId: plan.id },
          { merge: true },
        );
        toast({
          title: "Plan Updated!",
          description:
            "Your plan has been successfully updated to Trailblazer.",
        });
        router.push("/dashboard");
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
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error.message || "Failed to create checkout session.");
      }

      const { sessionId } = await response.json();
      const stripe = await getStripe();
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          throw error;
        }
      } else {
        throw new Error("Stripe.js is not loaded.");
      }
    } catch (error: unknown) {
      console.error("Error handling subscription:", error);
      toast({
        title: "Subscription Error",
        description: getErrorMessage(error),
        variant: "destructive",
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
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const { url } = await response.json();
      window.location.assign(url);
    } catch {
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

  const currentPlan = displayedPlans.find((p) => p.id === userData?.planTierId);

  return (
    <>
      <main className="container mx-auto px-4 py-12 md:py-24 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl aspect-[2/1] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse" />

        <div className="mx-auto max-w-4xl text-center mb-16">
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-primary leading-tight">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Trajectory</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Whether you&apos;re just starting your journey or ready to architect your legacy, we have a plan built for your ambition.
          </p>
        </div>

        {currentPlan && currentPlan.price > 0 && (
          <div className="mb-12 text-center">
            <Button onClick={handleManageBilling} variant="outline" size="lg" disabled={isProcessing} className="rounded-full px-8">
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              Manage Billing & Subscription
            </Button>
          </div>
        )}

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          {displayedPlans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "flex flex-col relative transition-all duration-500 hover:-translate-y-2 border-border/50 bg-secondary/10 backdrop-blur-sm overflow-hidden",
                userData?.planTierId === plan.id && "border-primary ring-2 ring-primary/50 shadow-2xl shadow-primary/10",
                plan.id === "pathfinder" && "md:scale-105 z-10 border-primary/50 bg-secondary/20"
              )}
            >
              {plan.id === "pathfinder" && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="pb-8">
                <CardTitle className="text-2xl font-bold font-headline">{plan.name}</CardTitle>
                <CardDescription className="pt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground font-headline">${plan.price}</span>
                    {plan.price > 0 && (
                      <span className="text-base text-muted-foreground font-medium">/month</span>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pb-8">
                <ul className="space-y-4">
                  {plan.features?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 bg-primary/10 rounded-full p-0.5">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  className={cn(
                    "w-full h-12 rounded-xl font-bold text-base transition-all",
                    plan.id === "pathfinder" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary hover:bg-secondary/80"
                  )}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={
                    isProcessing ||
                    (!!user &&
                      userData?.planTierId === plan.id &&
                      plan.id !== "trailblazer")
                  }
                >
                  {isProcessing && <Loader2 className="mr-2 animate-spin h-4 w-4" />}
                  {user && userData?.planTierId === plan.id
                    ? "Current Plan"
                    : plan.price === 0 ? "Get Started" : "Upgrade Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
