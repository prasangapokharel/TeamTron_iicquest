"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2 } from "lucide-react";
import { CreditsAlert, CreditsStatus } from "@/components/documents/credits-alert";
import { balanceApi, criteriaApi, documentApi } from "@/lib/api";
import { isInsufficientCredits } from "@/lib/errors";
import type { Criteria, VerificationResult } from "@/types/api";

export function VerifyPanel({ onVerified }: { onVerified?: (result: VerificationResult) => void }) {
  const router = useRouter();
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [criteriaId, setCriteriaId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [outOfCredits, setOutOfCredits] = useState(false);

  const loadBalance = useCallback(() => {
    setBalanceLoading(true);
    return balanceApi
      .get()
      .then((b) => {
        setBalance(b.balance);
        if (b.balance >= 1) setOutOfCredits(false);
        return b.balance;
      })
      .catch(() => {
        setBalance(null);
        return null;
      })
      .finally(() => setBalanceLoading(false));
  }, []);

  useEffect(() => {
    criteriaApi.list().then((list) => {
      setCriteria(list);
      if (list[0]) setCriteriaId(list[0].id);
    });
    loadBalance();
  }, [loadBalance]);

  useEffect(() => {
    const onFocus = () => loadBalance();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadBalance]);

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

  const noCredits = balance !== null && balance < 1;

  const submit = async () => {
    if (!criteriaId) return setError("Select a criteria");
    if (files.length < 1) return setError("Upload at least 1 image (max 5)");
    if (noCredits) {
      setOutOfCredits(true);
      return;
    }

    setError("");
    setOutOfCredits(false);
    setLoading(true);
    try {
      const res = await documentApi.verify(criteriaId, files);
      onVerified?.(res);
      reset();
      await loadBalance();
    } catch (e: unknown) {
      if (isInsufficientCredits(e)) {
        setOutOfCredits(true);
        setBalance(0);
        setError("");
      } else {
        setError(e instanceof Error ? e.message : "Verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const showCreditsAlert = outOfCredits || noCredits;

  return (
    <div className="verify-panel">
      <h2 className="settings-section-title">New verification</h2>
      <p className="settings-section-desc">
        Upload 1 to 5 images. We extract fields, run your rules, and sign on Tron if it passes.
      </p>

      <CreditsStatus balance={balance} loading={balanceLoading} />

      {showCreditsAlert && balance !== null && (
        <CreditsAlert balance={balance} blocked={outOfCredits && !noCredits} />
      )}

      <div className="auth-field">
        <label className="auth-label" htmlFor="criteria">
          Criteria
        </label>
        <select
          id="criteria"
          className="input-dark"
          value={criteriaId}
          onChange={(e) => setCriteriaId(e.target.value)}
          disabled={noCredits}
        >
          {criteria.map((c) => (
            <option key={c.id} value={c.id}>
              {c.data.name} ({c.data.category})
            </option>
          ))}
        </select>
      </div>

      <div className={`upload-zone${noCredits ? " upload-zone--disabled" : ""}`}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          multiple
          onChange={onFiles}
          className="upload-input"
          id="doc-file-upload"
          disabled={noCredits}
        />
        <label
          htmlFor="doc-file-upload"
          className={`upload-label${noCredits ? " upload-label--disabled" : ""}`}
        >
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
          disabled={loading || noCredits}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Analyzing…
            </>
          ) : noCredits ? (
            "Add credits to verify"
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
