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
