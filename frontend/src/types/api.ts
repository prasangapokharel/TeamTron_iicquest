/** API error shape from FastAPI */
export interface ApiError {
  detail: string | { msg: string; loc?: string[] }[];
}

export interface HealthResponse {
  status: string;
  service: string;
}

// ─── Auth & Company ─────────────────────────────────────────────────────────

export interface Company {
  id: string;
  company_name: string;
  email: string;
  logo: string;
  status: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  company_id: string;
}

export interface RegisterResponse {
  company_id: string;
  company_name: string;
  email: string;
}

export interface DashboardData {
  company: Company;
  documents: {
    total: number;
    verified: number;
    failed: number;
    pending: number;
    verification_rate_pct: number;
  };
  blockchain: { total_signed: number };
  financials: { total_spent_rs: number; total_payments: number };
  api: { active_keys: number };
  criteria: { enrolled: number };
  recent_verifications: RecentVerification[];
}

export interface RecentVerification {
  enroll_id: string;
  status: string;
  document_id: string;
  verdict?: string;
  risk_score?: number;
  criteria_name?: string;
  to_address?: string;
  verify_url?: string;
}

// ─── Category ───────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
}

export interface CategoryEnroll {
  enroll_id: string;
  category_id: string;
  name: string;
}

export interface CategoryEnrollCreateResponse {
  id: string;
  company_id: string;
  category_id: string;
}

// ─── Criteria ───────────────────────────────────────────────────────────────

export interface CriteriaRule {
  id?: string;
  field?: string;
  fields?: string[];
  check?: string;
  match?: string;
  severity?: string;
  description?: string;
  threshold?: number;
}

export interface CriteriaData {
  name: string;
  category: string;
  fields: string[];
  rules: CriteriaRule[];
  verdict_thresholds?: { green: number; orange: number };
}

export interface Criteria {
  id: string;
  data: CriteriaData;
}

/** GET /criteria/enrolled */
export interface CriteriaEnroll {
  enroll_id: string;
  criteria_id: string;
  data: CriteriaData;
}

/** POST /criteria/enroll */
export interface CriteriaEnrollCreateResponse {
  id: string;
  company_id: string;
  criteria_id: string;
  severity: string | null;
  message: string | null;
  is_critical: boolean;
}

// ─── Documents & Verify ─────────────────────────────────────────────────────

export interface DocumentListItem {
  enroll_id: string;
  document_id: string;
  paths: string[];
  status: string;
  verdict?: string;
  risk_score?: number;
  criteria_name?: string;
  criteria_category?: string;
  suggestion_count?: number;
}

/** GET /document/:enroll_id */
export interface DocumentDetail {
  enroll_id: string;
  document_id: string | null;
  paths: string[];
  status: string;
  verdict?: string;
  risk_score?: number;
  criteria_name?: string;
  criteria_category?: string;
  tron_signed?: boolean;
  txid?: string | null;
}

export interface DocumentCreateResponse {
  document_id: string;
  enroll_id: string;
  paths: string[];
}

export interface VerificationFlag {
  field: string;
  severity: string;
  value?: string;
  issue?: string | null;
  is_critical?: boolean;
  message?: string;
}

export interface DocumentResult {
  index: number;
  path: string;
  is_synthetic?: boolean;
  extracted_fields?: Record<string, string | null>;
  flags?: VerificationFlag[];
  risk_score?: number;
  verdict?: string;
  suggestions?: string[];
  error?: string;
}

export interface VerificationResult {
  enroll_id?: string;
  document_enroll_id?: string;
  document_id?: string;
  criteria_enroll_id?: string;
  paths?: string[];
  status: string;
  criteria?: { id: string; name: string; category: string };
  extracted_fields?: Record<string, string | null>;
  conflicts?: Record<string, string[]>;
  flags?: VerificationFlag[];
  suggestions?: string[];
  risk_score?: number;
  verdict?: string;
  is_synthetic?: boolean;
  synthetic_count?: number;
  documents?: DocumentResult[];
  tron_signed?: boolean;
  txid?: string;
  to_address?: string;
  hash?: string;
  verify_url?: string;
  tron_error?: string;
  cost_deducted?: number;
  balance_remaining?: number;
  signature?: {
    id: string;
    hash: string;
    txid: string;
    to_address: string;
    verify_url: string;
  };
}

// ─── Signature ──────────────────────────────────────────────────────────────

export interface SignatureItem {
  signature_id: string;
  document_enroll_id: string;
  document_status: string;
  hash: string;
  txid: string;
  to_address: string;
  verify_url: string;
  created_at?: string;
}

export interface SignatureDetail {
  hash?: string;
  txid?: string;
  to_address?: string;
  verify_url?: string;
  document_enroll_id?: string;
}

export interface SignatureSignResponse {
  hash: string;
  txid: string;
  to_address: string;
  verify_url: string;
}

export interface TxVerifyResponse {
  txid: string;
  status: string;
  hash: string;
  verify_url: string;
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

export interface ApiKeyItem {
  id: string;
  apikey: string;
  status: string;
}

export interface ApiKeyRevokeResponse {
  message: string;
  id: string;
}

// ─── Billing ────────────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  per_user: number;
}

export interface Payment {
  id: string;
  transaction_id: string;
  amount: number;
  date: string;
  plan_id: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
}

export interface EsewaInitResponse {
  transaction_id: string;
  esewa_url: string;
  fields: Record<string, string | number>;
}

export interface WalletTransaction {
  id: string;
  payment_method_id: number;
  amount: number;
  txid: string;
  status: "pending" | "success" | "failed" | string;
  created_at: string;
}

export interface Balance {
  company_id: string;
  balance: number;
}

// ─── Spoofing check ─────────────────────────────────────────────────────────

export interface SpoofingImageMeta {
  filename: string;
  file_hash: string;
  dimensions: string;
  file_size: number;
  phash: string | null;
  is_verified?: boolean;
  verified_at?: string | null;
}

export interface SpoofingComparison {
  exact_match: boolean;
  phash_distance: number | null;
  similarity_percent: number | null;
  verdict: "IDENTICAL" | "SIMILAR" | "DIFFERENT" | string;
}

export interface SpoofingVerifyResponse {
  image_a: SpoofingImageMeta;
  image_b: SpoofingImageMeta;
  comparison: SpoofingComparison;
  spoofing_detected: boolean;
  message: string;
}

// ─── Assistant ──────────────────────────────────────────────────────────────

export interface AssistantResponse {
  question: string;
  answer: string;
  context_summary: {
    data_source: string;
    vectorless: boolean;
    model?: string;
  };
}
