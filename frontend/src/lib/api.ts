/**
 * VivadX API client — mirrors backend/docs/frontend/postman/Apilist.json
 */
import { clearAuth, getToken } from "./auth";
import { API_BASE, API_ORIGIN } from "./config";
import { ApiRequestError, parseApiErrorBody } from "./errors";
import type {
  ApiKeyItem,
  ApiKeyRevokeResponse,
  AssistantResponse,
  Balance,
  Category,
  CategoryEnroll,
  CategoryEnrollCreateResponse,
  Company,
  Criteria,
  CriteriaEnroll,
  CriteriaEnrollCreateResponse,
  DashboardData,
  DocumentCreateResponse,
  DocumentDetail,
  DocumentListItem,
  EsewaInitResponse,
  HealthResponse,
  LoginResponse,
  Payment,
  PaymentMethod,
  Plan,
  RegisterResponse,
  SignatureDetail,
  SignatureItem,
  SignatureSignResponse,
  TxVerifyResponse,
  VerificationResult,
  WalletTransaction,
} from "@/types/api";

export { API_BASE, API_ORIGIN };

export { ApiRequestError } from "./errors";

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return parseApiErrorBody(data);
  } catch {
    return res.statusText || "Request failed";
  }
}

function handleUnauthorized() {
  clearAuth();
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (!path.startsWith("/login") && !path.startsWith("/signup")) {
      window.location.href = "/login?session=expired";
    }
  }
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (auth) {
    const token = getToken();
    if (!token) throw new ApiRequestError("Not authenticated", 401);
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && auth) {
    handleUnauthorized();
    throw new ApiRequestError("Session expired", 401);
  }

  if (!res.ok) throw new ApiRequestError(await parseError(res), res.status);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Optional X-Api-Key auth for integration-style calls from the dashboard. */
export async function requestWithApiKey<T>(
  path: string,
  apiKey: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("X-Api-Key", apiKey);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) throw new ApiRequestError(await parseError(res), res.status);
  return res.json() as Promise<T>;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () =>
    fetch(`${API_ORIGIN}/health`)
      .then(async (res) => {
        if (!res.ok) throw new ApiRequestError("Service unavailable", res.status);
        return res.json() as Promise<HealthResponse>;
      }),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: { company_name: string; email: string; password: string; logo?: string | null }) =>
    request<RegisterResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }, false),

  login: (body: { email: string; password: string }) =>
    request<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }, false),
};

// ─── Company ──────────────────────────────────────────────────────────────────

export const companyApi = {
  me: () => request<Company>("/company/me"),
  update: (body: { company_name?: string; logo?: string }) =>
    request<Company>("/company/me", { method: "PATCH", body: JSON.stringify(body) }),
  dashboard: () => request<DashboardData>("/company/dashboard"),
  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<Company>("/company/logo", { method: "POST", body: form });
  },
};

// ─── Balance ──────────────────────────────────────────────────────────────────

export const balanceApi = {
  get: () => request<Balance>("/balance"),
  topup: (amount: number) =>
    request<Balance>("/balance/topup", { method: "POST", body: JSON.stringify({ amount }) }),
};

// ─── Category ─────────────────────────────────────────────────────────────────

export const categoryApi = {
  list: () => request<Category[]>("/category"),
  create: (name: string) =>
    request<Category>("/category", { method: "POST", body: JSON.stringify({ name }) }),
  enroll: (category_id: string) =>
    request<CategoryEnrollCreateResponse>("/category/enroll", {
      method: "POST",
      body: JSON.stringify({ category_id }),
    }),
  enrolled: () => request<CategoryEnroll[]>("/category/enrolled"),
};

// ─── Criteria ─────────────────────────────────────────────────────────────────

export const criteriaApi = {
  list: () => request<Criteria[]>("/criteria"),
  create: (data: Criteria["data"]) =>
    request<Criteria>("/criteria", { method: "POST", body: JSON.stringify({ data }) }),
  enroll: (body: {
    criteria_id: string;
    severity?: string;
    message?: string;
    is_critical?: boolean;
  }) =>
    request<CriteriaEnrollCreateResponse>("/criteria/enroll", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  enrolled: () => request<CriteriaEnroll[]>("/criteria/enrolled"),
};

// ─── Document ─────────────────────────────────────────────────────────────────

export const documentApi = {
  create: (paths: string[]) =>
    request<DocumentCreateResponse>("/document", {
      method: "POST",
      body: JSON.stringify({ paths }),
    }),
  list: () => request<DocumentListItem[]>("/document"),
  get: (enrollId: string) => request<DocumentDetail>(`/document/${enrollId}`),
  result: (enrollId: string) => request<VerificationResult>(`/document/${enrollId}/result`),
  verify: (criteriaId: string, files: File[]) => {
    const form = new FormData();
    form.append("criteria_id", criteriaId);
    files.forEach((f) => form.append("files", f));
    return request<VerificationResult>("/document/verify", { method: "POST", body: form });
  },
};

// ─── Verify (primary integration path per workflow) ───────────────────────────

export const verifyApi = {
  /** POST /verify/upload — recommended for dashboard & API integrations */
  upload: (criteriaId: string, files: File[]) => {
    const form = new FormData();
    form.append("criteria_id", criteriaId);
    files.forEach((f) => form.append("files", f));
    return request<VerificationResult>("/verify/upload", { method: "POST", body: form });
  },
  /** POST /verify — JSON body with pre-uploaded file paths */
  withPaths: (criteriaId: string, paths: string[]) =>
    request<VerificationResult>("/verify", {
      method: "POST",
      body: JSON.stringify({ criteria_id: criteriaId, paths }),
    }),
};

// ─── Signature ────────────────────────────────────────────────────────────────

export const signatureApi = {
  list: () => request<SignatureItem[]>("/signature"),
  get: (enrollId: string) => request<SignatureDetail>(`/signature/${enrollId}`),
  sign: (document_enroll_id: string, fields: Record<string, string>) =>
    request<SignatureSignResponse>("/signature", {
      method: "POST",
      body: JSON.stringify({ document_enroll_id, fields }),
    }),
  verifyTx: (txid: string) =>
    request<TxVerifyResponse>(`/signature/verify/${txid}`, {}, false),
};

// ─── API Keys ─────────────────────────────────────────────────────────────────

export const apikeyApi = {
  list: () => request<ApiKeyItem[]>("/apikey"),
  generate: () => request<ApiKeyItem>("/apikey", { method: "POST" }),
  revoke: (id: string) =>
    request<ApiKeyRevokeResponse>(`/apikey/${id}`, { method: "DELETE" }),
};

// ─── Plan & Payment ───────────────────────────────────────────────────────────

export const planApi = {
  list: () => request<Plan[]>("/plan"),
};

export const paymentMethodApi = {
  list: () => request<PaymentMethod[]>("/payment_method", {}, false),
};

export const paymentApi = {
  list: () => request<Payment[]>("/payment"),
  create: (plan_id: string, amount: number) =>
    request<Payment>("/payment", { method: "POST", body: JSON.stringify({ plan_id, amount }) }),
  initializeEsewa: (amount: number) =>
    request<EsewaInitResponse>("/payment/initialize", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),
};

export const transactionApi = {
  list: () => request<WalletTransaction[]>("/transaction"),
};

// ─── Assistant ────────────────────────────────────────────────────────────────

export const assistantApi = {
  chat: (message: string) =>
    request<AssistantResponse>("/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
};

/** Single export grouping all API modules (matches Postman collection). */
export const vivadApi = {
  health: healthApi,
  auth: authApi,
  company: companyApi,
  balance: balanceApi,
  category: categoryApi,
  criteria: criteriaApi,
  document: documentApi,
  verify: verifyApi,
  signature: signatureApi,
  apikey: apikeyApi,
  plan: planApi,
  paymentMethod: paymentMethodApi,
  payment: paymentApi,
  transaction: transactionApi,
  assistant: assistantApi,
};
