"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { categoryApi } from "@/lib/api";
import { formatApiError } from "@/lib/errors";
import type { Category, CategoryEnroll } from "@/types/api";

interface CategoryPanelProps {
  categories: Category[];
  enrolled: CategoryEnroll[];
  onRefresh: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

export function CategoryPanel({
  categories,
  enrolled,
  onRefresh,
  onError,
  onSuccess,
}: CategoryPanelProps) {
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const enrolledIds = new Set(enrolled.map((e) => e.category_id));

  const create = async () => {
    const name = newName.trim();
    if (!name) return onError("Enter a category name");
    setCreating(true);
    onError("");
    try {
      await categoryApi.create(name);
      setNewName("");
      onSuccess("Category created.");
      onRefresh();
    } catch (e) {
      onError(formatApiError(e));
    } finally {
      setCreating(false);
    }
  };

  const enroll = async (categoryId: string) => {
    setEnrolling(categoryId);
    onError("");
    try {
      await categoryApi.enroll(categoryId);
      onSuccess("Category enrolled for your company.");
      onRefresh();
    } catch (e) {
      onError(formatApiError(e));
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div className="criteria-tab-panel">
      <div className="criteria-tab-head">
        <h2 className="settings-section-title">Document categories</h2>
        <p className="settings-section-desc">
          Enroll categories to organize criteria packs. Uses GET/POST /category and /category/enroll.
        </p>
      </div>

      <div className="category-create-row">
        <input
          className="input-dark flex-1"
          placeholder="New category name (e.g. Identity Documents)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          type="button"
          className="dash-btn dash-btn--primary"
          onClick={create}
          disabled={creating}
        >
          {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Create
        </button>
      </div>

      <div className="criteria-board-grid">
        {categories.map((cat) => {
          const isEnrolled = enrolledIds.has(cat.id);
          return (
            <article key={cat.id} className="criteria-board-card">
              <h3>{cat.name}</h3>
              <p className="criteria-board-meta">
                {isEnrolled ? "Enrolled for your workspace" : "Available to enroll"}
              </p>
              {!isEnrolled && (
                <button
                  type="button"
                  className="dash-btn dash-btn--ghost criteria-enroll-btn"
                  onClick={() => enroll(cat.id)}
                  disabled={enrolling === cat.id}
                >
                  {enrolling === cat.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Enroll category"
                  )}
                </button>
              )}
              {isEnrolled && (
                <span className="badge status-verified">Enrolled</span>
              )}
            </article>
          );
        })}
        {categories.length === 0 && (
          <p className="settings-section-desc">No categories yet. Create one above.</p>
        )}
      </div>
    </div>
  );
}
