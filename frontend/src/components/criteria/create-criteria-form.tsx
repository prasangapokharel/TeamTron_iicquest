"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { criteriaApi } from "@/lib/api";
import { formatApiError } from "@/lib/errors";

interface CreateCriteriaFormProps {
  onCreated: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

export function CreateCriteriaForm({ onCreated, onError, onSuccess }: CreateCriteriaFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Identity");
  const [fieldsText, setFieldsText] = useState("full_name, dob, document_number, expiry_date");
  const [ruleField, setRuleField] = useState("full_name");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fields = fieldsText
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    if (!name.trim()) return onError("Criteria name is required");
    if (fields.length === 0) return onError("Add at least one field");

    setSaving(true);
    onError("");
    try {
      await criteriaApi.create({
        name: name.trim(),
        category: category.trim(),
        fields,
        rules: [{ field: ruleField.trim() || fields[0], match: "cross_doc", severity: "high" }],
      });
      setName("");
      onSuccess("Custom criteria created. Enroll it from the Catalog tab.");
      onCreated();
    } catch (err) {
      onError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="criteria-tab-panel criteria-create-form" onSubmit={submit}>
      <div className="criteria-tab-head">
        <h2 className="settings-section-title">Create custom criteria</h2>
        <p className="settings-section-desc">
          POST /criteria with your own fields and rules. Enroll the pack before verifying documents.
        </p>
      </div>

      <div className="settings-fields">
        <div className="auth-field">
          <label className="auth-label" htmlFor="crit-name">Name</label>
          <input
            id="crit-name"
            className="input-dark"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Driving License Check"
            required
          />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="crit-cat">Category</label>
          <input
            id="crit-cat"
            className="input-dark"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Identity"
            required
          />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="crit-fields">Fields (comma-separated)</label>
          <input
            id="crit-fields"
            className="input-dark"
            value={fieldsText}
            onChange={(e) => setFieldsText(e.target.value)}
            placeholder="full_name, dob, license_number"
            required
          />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="crit-rule">Primary cross-doc rule field</label>
          <input
            id="crit-rule"
            className="input-dark"
            value={ruleField}
            onChange={(e) => setRuleField(e.target.value)}
            placeholder="full_name"
          />
        </div>
      </div>

      <button type="submit" className="dash-btn dash-btn--primary" disabled={saving}>
        {saving ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Creating…
          </>
        ) : (
          "Create criteria"
        )}
      </button>
    </form>
  );
}
