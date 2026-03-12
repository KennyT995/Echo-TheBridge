"use client";

import { useCollection, useDoc, useMemoFirebase, useFirestore, useUser } from "@/firebase";

import { collection, doc } from "firebase/firestore";
import { FirestorePaths } from "@/lib/firestore-paths";
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getStripe } from "@/lib/stripe";
import type { PlanTier, UserData } from "@/lib/types";
import { getErrorMessage } from "@/lib/error-utils";
import { logger } from "@/lib/logger";

const defaultPlans: PlanTier[] = [
  {
    id: "trailblazer",
    name: "Trailblazer",
    price: 0,
    maxVisions: 1,
    aiFeaturesEnabled: false,
    features: [
      "1 Strategic Vision",
      "Core Roadmap Generation",
      "Standard Analytical Output",
      "Community Access",
    ],
    stripePriceId: null,
  },
  {
    id: "pathfinder",
    name: "Pathfinder",
    price: 15,
    maxVisions: 5,
    aiFeaturesEnabled: true,
    features: [
      "5 Strategic Visions",
      "Advanced Neural Roadmap Sythesis",
      "AI Strategic Briefings",
      "Prioritized Feature Access",
      "Direct Architect Support",
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
      "Unlimited Vision Manifestation",
      "High-Fidelity AI Synthesis",
      "Real-time Strategic Briefings",
      "Elite Priority Response",
      "Legacy Archive Protocol",
      "Private Beta Invitations",
    ],
    stripePriceId: "price_1PXZFjRUD5S9xH2gX3eZ4w5A", // Replace with your actual Stripe Price ID
  },
];


export default function PlansPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const plansQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "plan_tiers");
  }, [firestore]);

  const { data: plans, isLoading: plansLoading } =
    useCollection<PlanTier>(plansQuery);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, FirestorePaths.user(user.uid));
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
        const { updateDocumentNonBlocking } = await import("@/firebase/non-blocking-updates");
        updateDocumentNonBlocking(userDocRef, { planTierId: plan.id });
        toast({
          title: "Protocol Initialized",
          description: "Your trajectory has been adjusted to the Trailblazer tier.",
        });
        router.push("/dashboard");
      } catch (error) {
        logger.error("Error updating to free plan: ", error);
        toast({
          variant: "destructive",
          title: "System Error",
          description: "Could not adjust trajectory. Recalibrate and try again.",
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
      logger.error("Error handling subscription:", error);
      toast({
        title: "Synthesis Error",
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
        title: "Transmission Failed",
        description: "Could not access billing matrix. Try again.",
      });
      setIsProcessing(false);
    }
  };

  if (plansLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-2 border-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full border-b-2 border-indigo-500 animate-spin-slow" />
          </div>
        </div>
      </div>
    );
  }

  const displayedPlans = plans && plans.length > 0 ? plans : defaultPlans;
  const currentPlan = displayedPlans.find((p) => p.id === userData?.planTierId);

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />

      <main className="container mx-auto px-6 py-12 md:py-24 relative z-10">
        <div className="mx-auto max-w-4xl text-center mb-24 animate-reveal">
          <div className="flex items-center justify-center gap-3 text-primary mb-6">
            <div className="h-px w-12 bg-primary/20" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Sector Selection</span>
            <div className="h-px w-12 bg-primary/20" />
          </div>
          <h1 className="font-headline text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] text-white">
            Architect Your <br /> <span className="text-gradient">Inevitable</span>
          </h1>
          <p className="mt-8 text-2xl text-muted-foreground/60 max-w-2xl mx-auto font-light leading-relaxed italic">
            &quot;The most reliable way to predict the future is to architect it.&quot;
          </p>
        </div>

        {currentPlan && currentPlan.price > 0 && (
          <div className="mb-16 flex justify-center animate-reveal delay-100">
            <Button
              onClick={handleManageBilling}
              variant="ghost"
              size="lg"
              disabled={isProcessing}
              className="h-16 px-10 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all text-lg font-bold group"
            >
              {isProcessing ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <ExternalLink className="mr-3 h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              )}
              Access Billing Matrix
            </Button>
          </div>
        )}

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3 animate-reveal delay-200">
          {displayedPlans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "flex flex-col relative transition-all duration-700 glass-card overflow-hidden rounded-[2.5rem] group hover:bg-white/[0.04]",
                userData?.planTierId === plan.id ? "bg-white/[0.08] shadow-[0_0_80px_rgba(var(--primary-rgb),0.1)] border-primary/20" : "border-white/5",
                plan.id === "pathfinder" && "md:scale-105"
              )}
            >
              {plan.id === "pathfinder" && (
                <div className="absolute top-0 right-0 p-8">
                  <div className="bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-primary/20 backdrop-blur-md">
                    Optimized Tier
                  </div>
                </div>
              )}

              <CardHeader className="p-10 pb-6">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 block">Trajectory-{plan.id.slice(0, 2).toUpperCase()}</span>
                  <CardTitle className="text-4xl font-headline font-black tracking-tighter group-hover:text-primary transition-colors">{plan.name}</CardTitle>
                </div>
                <CardDescription className="pt-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-white font-headline tracking-tighter">${plan.price}</span>
                    {plan.price > 0 && (
                      <span className="text-lg text-muted-foreground/40 font-light italic">/ lunar cycle</span>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow p-10 pt-4 space-y-10">
                <div className="h-px w-full bg-white/5" />
                <ul className="space-y-6">
                  {plan.features?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-4 group/item">
                      <div className="mt-1.5 bg-primary/10 rounded-full p-1 border border-primary/20 group-hover/item:scale-125 transition-transform">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-lg font-light leading-relaxed text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-10 pt-0">
                <Button
                  className={cn(
                    "w-full h-16 rounded-[1.5rem] font-black text-lg uppercase tracking-[0.2em] transition-all duration-500",
                    plan.id === "pathfinder"
                      ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95"
                      : "bg-white/5 text-white hover:bg-white/10 active:scale-95"
                  )}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={
                    isProcessing ||
                    (!!user &&
                      userData?.planTierId === plan.id &&
                      plan.id !== "trailblazer")
                  }
                >
                  {isProcessing && <Loader2 className="mr-3 animate-spin h-5 w-5" />}
                  {user && userData?.planTierId === plan.id
                    ? "Active Protocol"
                    : plan.price === 0 ? "Initialize" : "Execute Upgrade"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
