import { getToken } from "./auth";
import type {
  ApiError,
  AssistantResponse,
  ApiKeyItem,
  Balance,
  Category,
  CategoryEnroll,
  Company,
  Criteria,
  CriteriaEnroll,
  DashboardData,
  DocumentListItem,
  LoginResponse,
  Payment,
  Plan,
  RegisterResponse,
  SignatureItem,
  TxVerifyResponse,
  VerificationResult,
} from "@/types/api";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as ApiError;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) return data.detail.map((d) => d.msg).join(", ");
    return res.statusText;
  } catch {
    return res.statusText || "Request failed";
  }
}

async function request<T>(
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

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) throw new ApiRequestError(await parseError(res), res.status);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: { company_name: string; email: string; password: string; logo?: string | null }) =>
    request<RegisterResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }, false),

  login: (body: { email: string; password: string }) =>
    request<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }, false),
};

// ─── Company ────────────────────────────────────────────────────────────────

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

// ─── Balance ────────────────────────────────────────────────────────────────

export const balanceApi = {
  get: () => request<Balance>("/balance"),
  topup: (amount: number) =>
    request<Balance>("/balance/topup", { method: "POST", body: JSON.stringify({ amount }) }),
};

// ─── Category ───────────────────────────────────────────────────────────────

export const categoryApi = {
  list: () => request<Category[]>("/category"),
  create: (name: string) =>
    request<Category>("/category", { method: "POST", body: JSON.stringify({ name }) }),
  enroll: (category_id: string) =>
    request<{ id: string; company_id: string; category_id: string }>("/category/enroll", {
      method: "POST",
      body: JSON.stringify({ category_id }),
    }),
  enrolled: () => request<CategoryEnroll[]>("/category/enrolled"),
};

// ─── Criteria ───────────────────────────────────────────────────────────────

export const criteriaApi = {
  list: () => request<Criteria[]>("/criteria"),
  create: (data: Record<string, unknown>) =>
    request<Criteria>("/criteria", { method: "POST", body: JSON.stringify({ data }) }),
  enroll: (body: { criteria_id: string; severity?: string; message?: string; is_critical?: boolean }) =>
    request<Record<string, unknown>>("/criteria/enroll", { method: "POST", body: JSON.stringify(body) }),
  enrolled: () => request<CriteriaEnroll[]>("/criteria/enrolled"),
};

// ─── Document ───────────────────────────────────────────────────────────────

export const documentApi = {
  list: () => request<DocumentListItem[]>("/document"),
  get: (enrollId: string) => request<VerificationResult>(`/document/${enrollId}`),
  result: (enrollId: string) => request<VerificationResult>(`/document/${enrollId}/result`),
  verify: (criteriaId: string, files: File[]) => {
    const form = new FormData();
    form.append("criteria_id", criteriaId);
    files.forEach((f) => form.append("files", f));
    return request<VerificationResult>("/document/verify", { method: "POST", body: form });
  },
};

// ─── Verify (API path) ──────────────────────────────────────────────────────

export const verifyApi = {
  upload: (criteriaId: string, files: File[]) => {
    const form = new FormData();
    form.append("criteria_id", criteriaId);
    files.forEach((f) => form.append("files", f));
    return request<VerificationResult>("/verify/upload", { method: "POST", body: form });
  },
};

// ─── Signature ──────────────────────────────────────────────────────────────

export const signatureApi = {
  list: () => request<SignatureItem[]>("/signature"),
  get: (enrollId: string) => request<Record<string, string>>("/signature/" + enrollId),
  verifyTx: (txid: string) =>
    request<TxVerifyResponse>(`/signature/verify/${txid}`, {}, false),
};

// ─── API Keys ───────────────────────────────────────────────────────────────

export const apikeyApi = {
  list: () => request<ApiKeyItem[]>("/apikey"),
  generate: () => request<ApiKeyItem>("/apikey", { method: "POST" }),
  revoke: (id: string) => request<{ message: string; id: string }>(`/apikey/${id}`, { method: "DELETE" }),
};

// ─── Plan & Payment ─────────────────────────────────────────────────────────

export const planApi = {
  list: () => request<Plan[]>("/plan"),
};

export const paymentApi = {
  list: () => request<Payment[]>("/payment"),
  create: (plan_id: string, amount: number) =>
    request<Payment>("/payment", { method: "POST", body: JSON.stringify({ plan_id, amount }) }),
};

// ─── Assistant ──────────────────────────────────────────────────────────────

export const assistantApi = {
  chat: (message: string) =>
    request<AssistantResponse>("/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
};
