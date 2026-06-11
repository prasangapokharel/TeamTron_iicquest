"use client";

import { useEffect, useState } from "react";
import { Copy, Trash2, Plus, Check, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ApiDocsPanel } from "@/components/settings/api-docs-panel";
import { apikeyApi, criteriaApi } from "@/lib/api";
import type { ApiKeyItem, CriteriaEnroll } from "@/types/api";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [enrolled, setEnrolled] = useState<CriteriaEnroll[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    apikeyApi.list().then(setKeys).catch((e) => setError(e.message));
    criteriaApi.enrolled().then(setEnrolled).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async () => {
    setError("");
    try {
      const k = await apikeyApi.generate();
      setNewKey(k.apikey);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate key");
    }
  };

  const revoke = async (id: string) => {
    await apikeyApi.revoke(id);
    load();
  };

  const copyKey = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeCount = keys.filter((k) => k.status === "active").length;

  return (
    <div className="dash-content dash-content--saas">
      <PageHeader
        title="API Keys"
        description="Generate keys and integrate document verification into your systems"
        actions={
          <button type="button" className="dash-btn dash-btn--primary" onClick={generate}>
            <Plus size={14} />
            Generate key
          </button>
        }
      />

      {error && (
        <div className="settings-alerts">
          <p className="auth-error">{error}</p>
        </div>
      )}

      <section className="dash-board api-keys-board" aria-label="API keys">
        <div className="api-keys-main">
          {newKey && (
            <div className="api-key-reveal-block">
              <h2 className="settings-section-title">Your new API key</h2>
              <p className="settings-section-desc">
                Copy this key now and store it securely. It will not be shown again.
              </p>
              <code className="api-key-code">{newKey}</code>
              <button type="button" className="dash-btn dash-btn--primary" onClick={() => copyKey(newKey)}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy API key"}
              </button>
            </div>
          )}

          <div className="dash-cell-head">
            <div>
              <h2 className="dash-cell-title">Active keys</h2>
              <p className="dash-cell-desc">{activeCount} active · {keys.length} total</p>
            </div>
          </div>

          {keys.length === 0 ? (
            <div className="dash-board-empty">
              <p>No API keys yet. Generate one, then follow the integration guide below.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="dash-data-table data-table">
                <thead>
                  <tr>
                    <th>Key prefix</th>
                    <th>Status</th>
                    <th aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id}>
                      <td><code className="settings-id">{k.apikey.slice(0, 28)}…</code></td>
                      <td><span className="badge badge-ignored">{k.status}</span></td>
                      <td className="dash-table-action">
                        {k.status === "active" && (
                          <button
                            type="button"
                            className="dash-btn dash-btn--ghost api-revoke-btn"
                            onClick={() => revoke(k.id)}
                          >
                            <Trash2 size={14} /> Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="api-keys-quickstart">
          <div className="api-keys-quickstart-head">
            <BookOpen size={16} />
            <h2 className="settings-aside-title">Quick start</h2>
          </div>
          <ol className="api-doc-steps api-doc-steps--compact">
            <li className="api-doc-step">
              <span className="api-doc-step-num">1</span>
              <div>
                <h3>Enroll criteria</h3>
                <p>Pick a rule pack on the Criteria page.</p>
              </div>
            </li>
            <li className="api-doc-step">
              <span className="api-doc-step-num">2</span>
              <div>
                <h3>Add credits</h3>
                <p>1 credit per verification run.</p>
              </div>
            </li>
            <li className="api-doc-step">
              <span className="api-doc-step-num">3</span>
              <div>
                <h3>Generate key</h3>
                <p>Copy the key when it appears.</p>
              </div>
            </li>
            <li className="api-doc-step">
              <span className="api-doc-step-num">4</span>
              <div>
                <h3>Call the API</h3>
                <p>POST /verify/upload with X-Api-Key header.</p>
              </div>
            </li>
          </ol>
          <a href="#api-integration-guide" className="dash-text-link api-keys-scroll-link">
            Full documentation below
          </a>
        </aside>
      </section>

      <section
        id="api-integration-guide"
        className="dash-board api-docs-board"
        aria-label="API integration documentation"
      >
        <ApiDocsPanel enrolled={enrolled} />
      </section>
    </div>
  );
}
