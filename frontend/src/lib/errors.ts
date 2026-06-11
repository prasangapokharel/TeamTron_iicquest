import type { ApiError } from "@/types/api";

export class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function parseApiErrorBody(data: ApiError): string {
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((d) => d.msg).join(", ");
  }
  return "Request failed";
}

export function isInsufficientCredits(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 402;
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 401;
}

export function isConflict(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 409;
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 404;
}

export function isValidationError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 422;
}

export function isServerError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status >= 500;
}

/** Map FastAPI errors to user-facing strings (matches workflow.txt). */
export function formatApiError(error: unknown): string {
  if (!(error instanceof ApiRequestError)) {
    return error instanceof Error ? error.message : "Something went wrong";
  }

  const msg = error.message;

  if (error.status === 401) return "Session expired. Please sign in again.";
  if (error.status === 402) {
    return msg.includes("Insufficient")
      ? msg
      : "Not enough credits. Top up on Balance to continue.";
  }
  if (error.status === 409 && msg.toLowerCase().includes("email")) {
    return "An account with this email already exists.";
  }
  if (error.status === 409 && msg.toLowerCase().includes("enrolled")) {
    return "This criteria is already enrolled.";
  }
  if (error.status === 413) return "File too large. Maximum size is 5MB.";
  if (error.status === 502 && msg.includes("AI")) {
    return "Assistant is temporarily unavailable. Try again in a moment.";
  }

  return msg;
}
