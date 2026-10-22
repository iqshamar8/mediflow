import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "IQD"): string {
  if (currency === "IQD") {
    return `${amount.toLocaleString()} د.ع`;
  }
  return `${amount.toLocaleString()} ${currency}`;
}
