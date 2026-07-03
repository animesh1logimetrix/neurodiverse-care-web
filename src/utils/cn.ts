import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to smartly merge Tailwind classes.
 * Perfect for building reusable UI components with Radix.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
