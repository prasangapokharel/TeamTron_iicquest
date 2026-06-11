"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { CategoryPanel } from "@/components/criteria/category-panel";
import { CreateCriteriaForm } from "@/components/criteria/create-criteria-form";
import { categoryApi, criteriaApi } from "@/lib/api";
import { formatApiError } from "@/lib/errors";
import type { Category, CategoryEnroll, Criteria, CriteriaEnroll } from "@/types/api";

type Tab = "catalog" | "categories" | "create";

export default function CriteriaPage() {
  const [tab, setTab] = useState<Tab>("catalog");
  const [all, setAll] = useState<Criteria[]>([]);
  const [enrolled, setEnrolled] = useState<CriteriaEnroll[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enrolledCategories, setEnrolledCategories] = useState<CategoryEnroll[]>([]);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const loadCriteria = () =>
    Promise.all([criteriaApi.list(), criteriaApi.enrolled()])
      .then(([list, en]) => {
        setAll(list);
        setEnrolled(en);
      });

  const loadCategories = () =>
    Promise.all([categoryApi.list(), categoryApi.enrolled()])
      .then(([list, en]) => {
        setCategories(list);
        setEnrolledCategories(en);
      });

  const load = () => {
    Promise.all([loadCriteria(), loadCategories()]).catch((e) => setError(formatApiError(e)));
  };

  useEffect(() => load(), []);

  const enrolledIds = new Set(enrolled.map((e) => e.criteria_id));

  const enroll = async (id: string) => {
    setEnrolling(id);
    setMsg("");
    setError("");
    try {
      await criteriaApi.enroll({
        criteria_id: id,
        severity: "high",
        message: "Critical KYC check",
        is_critical: true,
      });
      setMsg("Criteria enrolled successfully.");
      loadCriteria();
    } catch (e: unknown) {
      setError(formatApiError(e));
    } finally {
      setEnrolling(null);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "catalog", label: "Criteria catalog" },
    { id: "categories", label: "Categories" },
    { id: "create", label: "Create custom" },
  ];

  return (
    <div className="dash-content dash-content--saas">
      <PageHeader
        title="Criteria"
        description="Enroll rule packs and categories before you run document checks"
        actions={<span className="docs-count-pill">{enrolled.length} enrolled</span>}
      />

      {(error || msg) && (
        <div className="settings-alerts">
          {error && <p className="auth-error">{error}</p>}
          {msg && <p className="success-banner">{msg}</p>}
        </div>
      )}

      <div className="criteria-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`criteria-tab${tab === t.id ? " criteria-tab--active" : ""}`}
            onClick={() => {
              setTab(t.id);
              setError("");
              setMsg("");
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "catalog" && (
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
                    {c.data.fields.length} fields, {c.data.rules.length} rules
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
      )}

      {tab === "categories" && (
        <section className="dash-board criteria-board" aria-label="Categories">
          <CategoryPanel
            categories={categories}
            enrolled={enrolledCategories}
            onRefresh={loadCategories}
            onError={setError}
            onSuccess={setMsg}
          />
        </section>
      )}

      {tab === "create" && (
        <section className="dash-board criteria-board" aria-label="Create criteria">
          <CreateCriteriaForm
            onCreated={loadCriteria}
            onError={setError}
            onSuccess={setMsg}
          />
        </section>
      )}
    </div>
  );
}
