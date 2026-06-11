import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const SPECS = [
  { term: "Verify", detail: "Upload docs and get a clear pass/fail with a risk score" },
  { term: "Integrate", detail: "Plug into your stack with API keys scoped to your company" },
  { term: "Audit", detail: "Approved runs get a Tron hash anyone can check" },
];

export function AuthLayout({
  children,
  title,
  subtitle,
  footer,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-aside">
          <Link href="/" className="auth-back">
            <ArrowLeft size={14} strokeWidth={1.75} />
            Home
          </Link>

          <div className="auth-aside-body">
            <Logo size="lg" href="/" />
            <p className="auth-aside-lead">
              Document checks for banks, manpower agencies, and consultancies in Nepal.
            </p>
          </div>

          <dl className="auth-specs">
            {SPECS.map((item) => (
              <div key={item.term} className="auth-spec">
                <dt>{item.term}</dt>
                <dd>{item.detail}</dd>
              </div>
            ))}
          </dl>
        </aside>

        <main className="auth-main">
          <div className="auth-main-inner">
            <div className="auth-main-logo">
              <Logo href="/" />
            </div>

            <header className="auth-header">
              <h1 className="auth-header-title">{title}</h1>
              <p className="auth-header-desc">{subtitle}</p>
            </header>

            <div className="auth-body">{children}</div>

            {footer && <div className="auth-footer">{footer}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AuthField({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && <p className="auth-field-hint">{hint}</p>}
    </div>
  );
}
