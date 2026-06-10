import Link from "next/link";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const DEFAULT_PERKS = [
  "AI-powered document analysis in seconds",
  "Red / Orange / Green risk flags",
  "Tron blockchain verification proof",
  "Dynamic rules for every industry",
];

export function AuthLayout({
  children,
  title,
  subtitle,
  perks = DEFAULT_PERKS,
  footer,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  perks?: string[];
  footer?: React.ReactNode;
}) {
  return (
    <div className="auth-page">
      <div className="auth-split">
        <aside className="auth-brand-panel">
          <div className="auth-brand-inner">
            <Link href="/" className="auth-back-home">
              <ArrowLeft size={14} />
              Back to home
            </Link>
            <Logo className="mt-8" />
            <h1 className="auth-brand-title">
              Verify documents in seconds, not hours.
            </h1>
            <p className="auth-brand-subtitle">
              VivadX helps banks and agencies reconcile documents with AI and
              blockchain-backed audit trails.
            </p>
            <ul className="auth-perks">
              {perks.map((p) => (
                <li key={p}>
                  <CheckCircle size={16} strokeWidth={2} />
                  {p}
                </li>
              ))}
            </ul>
            <blockquote className="auth-quote">
              <p>
                &ldquo;We cut document verification time from 2 hours to under
                10 seconds — with proof auditors actually trust.&rdquo;
              </p>
              <footer>Compliance officer, commercial bank</footer>
            </blockquote>
          </div>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-form-wrap">
            <div className="auth-mobile-logo md:hidden">
              <Logo />
            </div>
            <div className="auth-card">
              <div className="auth-card-header">
                <h2 className="auth-card-title">{title}</h2>
                <p className="auth-card-subtitle">{subtitle}</p>
              </div>
              {children}
            </div>
            {footer && <div className="auth-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}
