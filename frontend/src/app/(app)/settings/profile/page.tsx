"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Upload, Wallet, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { balanceApi, companyApi } from "@/lib/api";
import { API_ORIGIN } from "@/lib/config";
import type { Company } from "@/types/api";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [balance, setBalance] = useState(0);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([companyApi.me(), balanceApi.get()]).then(([c, b]) => {
      setCompany(c);
      setName(c.company_name);
      setBalance(b.balance);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    setMsg("");
    try {
      const updated = await companyApi.update({ company_name: name });
      setCompany(updated);
      setMsg("Profile updated successfully.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const onLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setMsg("");
    try {
      const updated = await companyApi.uploadLogo(file);
      setCompany(updated);
      setMsg("Logo updated successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const logoSrc = company?.logo?.startsWith("/")
    ? `${API_ORIGIN}${company.logo}`
    : company?.logo;

  return (
    <div className="dash-content dash-content--saas">
      <PageHeader
        title="Profile"
        description="Organization details, branding, and account information"
      />

      {(error || msg) && (
        <div className="settings-alerts">
          {error && <p className="auth-error">{error}</p>}
          {msg && <p className="success-banner">{msg}</p>}
        </div>
      )}

      <section className="dash-board settings-board" aria-label="Profile settings">
        <div className="settings-board-main">
          <div className="settings-section">
            <h2 className="settings-section-title">Organization</h2>
            <p className="settings-section-desc">Name and logo shown across verifications and exports.</p>

            {company && (
              <div className="profile-logo-block">
                <div className="profile-logo-preview">
                  {logoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoSrc} alt={`${company.company_name} logo`} />
                  ) : (
                    <span>{initials(company.company_name)}</span>
                  )}
                </div>
                <div className="profile-logo-actions">
                  <p className="profile-logo-hint">PNG or JPG · Recommended 256×256px</p>
                  <label className="dash-btn dash-btn--ghost profile-upload-btn">
                    {uploading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    {uploading ? "Uploading…" : "Upload logo"}
                    <input type="file" accept="image/*" className="hidden" onChange={onLogo} />
                  </label>
                </div>
              </div>
            )}

            <div className="settings-fields">
              <div className="auth-field">
                <label className="auth-label" htmlFor="company-name">
                  Company name
                </label>
                <input
                  id="company-name"
                  className="input-dark"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="company-email">
                  Email
                </label>
                <input
                  id="company-email"
                  className="input-dark"
                  value={company?.email ?? ""}
                  disabled
                />
                <p className="settings-field-hint">Contact support to change your login email.</p>
              </div>
            </div>

            <div className="settings-actions">
              <button type="button" className="dash-btn dash-btn--primary" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>

        <aside className="settings-board-aside">
          <div className="settings-aside-block">
            <h2 className="settings-aside-title">Account</h2>
            <dl className="settings-meta-list">
              <div>
                <dt>Status</dt>
                <dd className={`settings-status settings-status--${company?.status ?? "active"}`}>
                  {company?.status ?? "—"}
                </dd>
              </div>
              <div>
                <dt>Credits</dt>
                <dd>{balance}</dd>
              </div>
              <div>
                <dt>Company ID</dt>
                <dd>
                  <code className="settings-id">{company?.id?.slice(0, 8) ?? "—"}</code>
                </dd>
              </div>
              <div>
                <dt>Workspace</dt>
                <dd>{company?.company_name ?? "—"}</dd>
              </div>
            </dl>
          </div>

          <nav className="settings-aside-links" aria-label="Related settings">
            <Link href="/settings/balance" className="settings-aside-link">
              <Wallet size={14} />
              Top up balance
              <ArrowUpRight size={13} />
            </Link>
            <Link href="/settings/api-keys" className="settings-aside-link">
              Manage API keys
              <ArrowUpRight size={13} />
            </Link>
          </nav>
        </aside>
      </section>
    </div>
  );
}
