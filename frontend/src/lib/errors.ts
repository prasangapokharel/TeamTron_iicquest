import { ApiRequestError } from "@/lib/api";

export function isInsufficientCredits(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 402;
}
