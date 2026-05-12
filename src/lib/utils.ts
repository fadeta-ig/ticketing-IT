import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatErrorMessage(error: any): string {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    // Check if it's a ZodError
    if (error.name === "ZodError" && Array.isArray(error.issues)) {
      return error.issues[0].message;
    }

    // Check for standard message property
    if (error.message && typeof error.message === "string") {
      // Sometimes message themselves are JSON strings
      try {
        const parsed = JSON.parse(error.message);
        if (typeof parsed === "string") return parsed;
        if (parsed.message) return String(parsed.message);
      } catch (e) {
        // Not JSON, return as is
      }
      return error.message;
    }
  }

  return "Terjadi kesalahan yang tidak terduga";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SafeAny = any;
