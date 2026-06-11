export interface ApiError {
  detail: string | { msg: string }[];
}

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

export interface Category {
  id: string;
  name: string;
}

export interface CategoryEnroll {
  enroll_id: string;
  category_id: string;
  name: string;
}

export interface CriteriaRule {
  id?: string;
  field?: string;
  fields?: string[];
  check?: string;
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

export interface CriteriaEnroll {
  enroll_id: string;
  criteria_id: string;
  data: CriteriaData;
}

export interface DocumentListItem {
  enroll_id: string;
  document_id: string;
  paths: string[];
  status: string;
  verdict?: string;
  risk_score?: number;
  criteria_name?: string;
  suggestion_count?: number;
}

export interface VerificationFlag {
  field: string;
  severity: string;
  value?: string;
  issue?: string | null;
  is_critical?: boolean;
}

export interface VerificationResult {
  enroll_id?: string;
  document_enroll_id?: string;
  document_id?: string;
  paths?: string[];
  status: string;
  criteria?: { id: string; name: string; category: string };
  extracted_fields?: Record<string, string | null>;
  conflicts?: Record<string, string[]>;
  flags?: VerificationFlag[];
  suggestions?: string[];
  risk_score?: number;
  verdict?: string;
  tron_signed?: boolean;
  txid?: string;
  to_address?: string;
  hash?: string;
  verify_url?: string;
  tron_error?: string;
  signature?: {
    id: string;
    hash: string;
    txid: string;
    to_address: string;
    verify_url: string;
  };
}

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

export interface ApiKeyItem {
  id: string;
  apikey: string;
  status: string;
}

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

export interface AssistantResponse {
  question: string;
  answer: string;
  context_summary: { data_source: string; vectorless: boolean };
}

export interface TxVerifyResponse {
  txid: string;
  status: string;
  hash: string;
  verify_url: string;
}
