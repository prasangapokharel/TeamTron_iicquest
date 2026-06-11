"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2 } from "lucide-react";
import { criteriaApi, documentApi } from "@/lib/api";
import type { Criteria, VerificationResult } from "@/types/api";

export function VerifyPanel({ onVerified }: { onVerified?: (result: VerificationResult) => void }) {
  const router = useRouter();
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [criteriaId, setCriteriaId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    criteriaApi.list().then((list) => {
      setCriteria(list);
      if (list[0]) setCriteriaId(list[0].id);
    });
  }, []);

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...picked].slice(0, 5));
    e.target.value = "";
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const reset = () => {
    setFiles([]);
    setError("");
  };

  const submit = async () => {
    if (!criteriaId) return setError("Select a criteria");
    if (files.length < 1) return setError("Upload at least 1 image (max 5)");
    setError("");
    setLoading(true);
    try {
      const res = await documentApi.verify(criteriaId, files);
      onVerified?.(res);
      reset();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-panel">
      <h2 className="settings-section-title">New verification</h2>
      <p className="settings-section-desc">
        Upload 1 to 5 images. We extract fields, run your rules, and sign on Tron if it passes.
      </p>

      <div className="auth-field">
        <label className="auth-label" htmlFor="criteria">
          Criteria
        </label>
        <select
          id="criteria"
          className="input-dark"
          value={criteriaId}
          onChange={(e) => setCriteriaId(e.target.value)}
        >
          {criteria.map((c) => (
            <option key={c.id} value={c.id}>
              {c.data.name} ({c.data.category})
            </option>
          ))}
        </select>
      </div>

      <div className="upload-zone">
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          multiple
          onChange={onFiles}
          className="upload-input"
          id="doc-file-upload"
        />
        <label htmlFor="doc-file-upload" className="upload-label">
          <Upload size={22} />
          <span>Drop images or click to browse</span>
          <span className="verify-upload-hint">JPG or PNG, up to 5 files, 10MB each</span>
        </label>
      </div>

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, i) => (
            <li key={i}>
              <span className="truncate">{f.name}</span>
              <button type="button" onClick={() => removeFile(i)} aria-label="Remove">
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="auth-error">{error}</p>}

      <div className="verify-panel-actions">
        <button
          type="button"
          className="dash-btn dash-btn--primary"
          onClick={submit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Analyzing…
            </>
          ) : (
            "Run verification"
          )}
        </button>
        {criteria.length === 0 && (
          <button
            type="button"
            className="dash-btn dash-btn--ghost"
            onClick={() => router.push("/criteria")}
          >
            Enroll criteria
          </button>
        )}
      </div>
    </div>
  );
}
