import Link from "next/link";
import { AuthField, AuthLayout } from "@/components/marketing/auth-layout";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your company dashboard"
      footer={
        <p>
          No account?{" "}
          <Link href="/signup">Create one</Link>
        </p>
      }
    >
      <form className="auth-form">
        <AuthField id="email" label="Email">
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
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
            autoComplete="current-password"
          />
        </AuthField>
        <button type="button" className="btn-primary auth-submit w-full justify-center">
          Sign in
        </button>
      </form>
    </AuthLayout>
  );
}
