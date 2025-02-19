// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { cn } from "@/lib/utils";



export function cnLocal(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
