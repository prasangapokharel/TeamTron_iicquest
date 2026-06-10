"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { criteriaApi } from "@/lib/api";
import type { Criteria, CriteriaEnroll } from "@/types/api";

export default function CriteriaPage() {
  const [all, setAll] = useState<Criteria[]>([]);
  const [enrolled, setEnrolled] = useState<CriteriaEnroll[]>([]);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    Promise.all([criteriaApi.list(), criteriaApi.enrolled()])
      .then(([list, en]) => {
        setAll(list);
        setEnrolled(en);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(() => load(), []);

  const enrolledIds = new Set(enrolled.map((e) => e.criteria_id));

  const enroll = async (id: string) => {
    setEnrolling(id);
    setMsg("");
    setError("");
    try {
      await criteriaApi.enroll({ criteria_id: id, is_critical: true });
      setMsg("Criteria enrolled successfully.");
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Enroll failed");
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div className="dash-content dash-content--saas">
      <PageHeader
        title="Criteria"
        description="Verification rule packs — enroll before running document checks"
        actions={<span className="docs-count-pill">{enrolled.length} enrolled</span>}
      />

      {(error || msg) && (
        <div className="settings-alerts">
          {error && <p className="auth-error">{error}</p>}
          {msg && <p className="success-banner">{msg}</p>}
        </div>
      )}

      <section className="dash-board criteria-board" aria-label="Criteria catalog">
        <div className="criteria-board-metrics">
          <div className="balance-metric">
            <div>
              <p className="balance-metric-value">{all.length}</p>
              <p className="balance-metric-label">Available packs</p>
            </div>
          </div>
          <div className="balance-metric">
            <div>
              <p className="balance-metric-value">{enrolled.length}</p>
              <p className="balance-metric-label">Enrolled</p>
            </div>
          </div>
          <div className="balance-metric">
            <div>
              <p className="balance-metric-value">
                {all.reduce((n, c) => n + c.data.rules.length, 0)}
              </p>
              <p className="balance-metric-label">Total rules</p>
            </div>
          </div>
        </div>

        <div className="criteria-board-grid">
          {all.map((c) => {
            const isEnrolled = enrolledIds.has(c.id);
            return (
              <article key={c.id} className="criteria-board-card">
                <div className="criteria-card-head">
                  <div>
                    <h3>{c.data.name}</h3>
                    <p className="criteria-board-category">{c.data.category}</p>
                  </div>
                  {isEnrolled && (
                    <span className="badge status-verified inline-flex items-center gap-1">
                      <CheckCircle size={12} /> Enrolled
                    </span>
                  )}
                </div>

                <p className="criteria-board-meta">
                  {c.data.fields.length} fields · {c.data.rules.length} rules
                </p>

                <div className="criteria-fields">
                  {c.data.fields.slice(0, 6).map((f) => (
                    <span key={f} className="criteria-chip">{f}</span>
                  ))}
                  {c.data.fields.length > 6 && (
                    <span className="criteria-chip">+{c.data.fields.length - 6}</span>
                  )}
                </div>

                {!isEnrolled && (
                  <button
                    type="button"
                    className="dash-btn dash-btn--ghost criteria-enroll-btn"
                    onClick={() => enroll(c.id)}
                    disabled={enrolling === c.id}
                  >
                    {enrolling === c.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Enroll criteria"
                    )}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
