"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthField, AuthLayout } from "@/components/marketing/auth-layout";
import { AuthInput, AuthSelect } from "@/components/marketing/auth-input";
import { authApi, balanceApi } from "@/lib/api";
import { setAuth } from "@/lib/auth";

const CATEGORIES = ["Bank", "Manpower Agency", "Consultancy", "Insurance", "Others"];

export default function SignupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await authApi.register({
        company_name: companyName,
        email,
        password,
        logo: null,
      });
      const login = await authApi.login({ email, password });
      setAuth(login.access_token, login.company_id);
      try {
        await balanceApi.topup(100);
      } catch {
        /* optional welcome credits */
      }
      void category;
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Register"
      subtitle="Create an organization account. New workspaces start with 100 credits."
      footer={
        <p>
          Have an account? <Link href="/login">Sign in</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <AuthField id="company" label="Organization">
          <AuthInput
            id="company"
            type="text"
            placeholder="Company name"
            autoComplete="organization"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </AuthField>

        <AuthField id="category" label="Industry">
          <AuthSelect
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </AuthSelect>
        </AuthField>

        <AuthField id="email" label="Email">
          <AuthInput
            id="email"
            type="email"
            placeholder="admin@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </AuthField>

        <AuthField id="password" label="Password" hint="At least 8 characters">
          <AuthInput
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </AuthField>

        <button type="submit" className="auth-submit dash-btn dash-btn--primary" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={14} className="auth-spin" aria-hidden />
              Creating account
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
