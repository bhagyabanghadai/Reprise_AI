// src/lib/utils.ts

// Import required dependencies
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to conditionally combine class names and handle Tailwind class merging.
 * 
 * @param inputs - An array of class values that can include conditional class names.
 * @returns A single string containing the merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
