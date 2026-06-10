import Link from "next/link";
import { AuthField, AuthLayout } from "@/components/marketing/auth-layout";

const CATEGORIES = [
  "Bank",
  "Manpower Agency",
  "Consultancy",
  "Insurance",
  "Others",
];

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register your company on VivadX"
      footer={
        <p>
          Already registered?{" "}
          <Link href="/login">Sign in</Link>
        </p>
      }
    >
      <form className="auth-form">
        <AuthField id="company" label="Company Name">
          <input
            id="company"
            type="text"
            placeholder="Acme Bank Ltd."
            className="input-dark"
            autoComplete="organization"
          />
        </AuthField>
        <AuthField id="category" label="Category">
          <select id="category" className="input-dark" defaultValue={CATEGORIES[0]}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </AuthField>
        <AuthField id="email" label="Email">
          <input
            id="email"
            type="email"
            placeholder="admin@company.com"
            className="input-dark"
            autoComplete="email"
          />
        </AuthField>
        <AuthField id="password" label="Password">
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="input-dark"
            autoComplete="new-password"
          />
        </AuthField>
        <button type="button" className="btn-primary auth-submit w-full justify-center">
          Create account
        </button>
      </form>
    </AuthLayout>
  );
}
