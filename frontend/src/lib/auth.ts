const TOKEN_KEY = "vivadx_token";
const COMPANY_ID_KEY = "vivadx_company_id";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token: string, companyId: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(COMPANY_ID_KEY, companyId);
  document.cookie = `vivadx_token=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(COMPANY_ID_KEY);
  document.cookie = "vivadx_token=; path=/; max-age=0";
}

export function getCompanyId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(COMPANY_ID_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
