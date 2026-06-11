import { planApi } from "@/lib/api";

/** Default from backend plan seed (`per_user=50`). */
export const DEFAULT_CREDIT_PRICE_RS = 50;
export const DEFAULT_VERIFY_COST_CREDITS = 50;

export interface PlanPricing {
  creditPriceRs: number;
  verifyCostCredits: number;
}

export async function fetchPlanPricing(): Promise<PlanPricing> {
  try {
    const plans = await planApi.list();
    const perUser = plans[0]?.per_user ?? DEFAULT_CREDIT_PRICE_RS;
    return { creditPriceRs: perUser, verifyCostCredits: perUser };
  } catch {
    return {
      creditPriceRs: DEFAULT_CREDIT_PRICE_RS,
      verifyCostCredits: DEFAULT_VERIFY_COST_CREDITS,
    };
  }
}

export function creditsFromRs(amountRs: number, creditPriceRs: number): number {
  if (creditPriceRs <= 0) return amountRs;
  return Math.floor(amountRs / creditPriceRs);
}

export function verificationsFromBalance(balance: number, verifyCostCredits: number): number {
  if (verifyCostCredits <= 0) return balance;
  return Math.floor(balance / verifyCostCredits);
}
