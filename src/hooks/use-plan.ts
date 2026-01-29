"use client";

import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { UserData, PlanTier } from "@/lib/types";

export function usePlan(userData: UserData | null | undefined) {
  const firestore = useFirestore();

  const planRef = useMemoFirebase(() => {
    if (!firestore || !userData?.planTierId) return null;
    return doc(firestore, "plan_tiers", userData.planTierId);
  }, [userData, firestore]);

  const { data: planData, isLoading: isPlanLoading } =
    useDoc<PlanTier>(planRef);

  return { plan: planData, isPlanLoading };
}
