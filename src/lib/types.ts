export * from "@/features/visions/types";
export * from "@/features/roadmaps/types";

export interface UserData {
  id: string;
  email: string;
  displayName?: string;
  planTierId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: Date;
}

export interface PlanTier {
  id: string;
  name: string;
  maxVisions: number;
  aiFeaturesEnabled: boolean;
  price: number;
  features: string[];
  stripePriceId: string | null;
}
