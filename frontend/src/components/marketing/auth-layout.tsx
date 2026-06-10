import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const SPECS = [
  { term: "Verify", detail: "Upload documents and receive a structured risk verdict" },
  { term: "Integrate", detail: "REST API with company-scoped keys" },
  { term: "Audit", detail: "Each approved run anchored on Tron" },
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
              Document verification for regulated teams in Nepal.
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
