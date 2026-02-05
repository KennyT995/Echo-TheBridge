import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toJsDate(date: unknown): Date | null {
  if (!date) return null;
  if (
    typeof date === "object" &&
    date !== null &&
    "toDate" in date &&
    typeof (date as { toDate: unknown }).toDate === "function"
  ) {
    return (date as { toDate: () => Date }).toDate();
  }
  if (date instanceof Date) return date;
  if (typeof date === "string") return new Date(date);
  return null;
}

// Helper types needed if not importing Roadmap (but wait, Roadmap is in types)
// Better to import Roadmap type or use any if we want to avoid circular dep, but utils usually shouldn't depend on features types.
// However, shared types are in "@/lib/types", so it's fine.
import { Roadmap } from "@/lib/types";

export function calculateOverallProgress(roadmap: Roadmap): number {
  const allItems = [
    ...(roadmap.visionTimeline || []),
    ...(roadmap.dailyHabits || []),
    ...(roadmap.weeklyTactics || []),
    ...(roadmap.monthlySprints || []),
    ...(roadmap.yearlyMilestones || []),
  ];
  if (allItems.length === 0) return 0;
  const completedItems = allItems.filter((item) => item.completed).length;
  return (completedItems / allItems.length) * 100;
}
