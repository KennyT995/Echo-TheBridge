export * from '@/features/visions/types';
export * from '@/features/roadmaps/types';

export interface UserData {
  id: string;
  email: string;
  planTierId: string;
}

export interface PlanTier {
  id: string;
  name: string;
  maxVisions: number;
  aiFeaturesEnabled: boolean;
  price: number;
  features: string[];
}
