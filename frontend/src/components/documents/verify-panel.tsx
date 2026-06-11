"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2 } from "lucide-react";
import { CreditsAlert, CreditsStatus } from "@/components/documents/credits-alert";
import { balanceApi, criteriaApi, verifyApi } from "@/lib/api";
import { fetchPlanPricing } from "@/lib/pricing";
import { formatApiError, isInsufficientCredits } from "@/lib/errors";
import type { CriteriaEnroll, VerificationResult } from "@/types/api";

export function VerifyPanel({ onVerified }: { onVerified?: (result: VerificationResult) => void }) {
  const router = useRouter();
  const [enrolled, setEnrolled] = useState<CriteriaEnroll[]>([]);
  const [criteriaId, setCriteriaId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [outOfCredits, setOutOfCredits] = useState(false);
  const [verifyCost, setVerifyCost] = useState(50);

  useEffect(() => {
    fetchPlanPricing().then(({ verifyCostCredits }) => setVerifyCost(verifyCostCredits));
  }, []);

  const loadBalance = useCallback(() => {
    setBalanceLoading(true);
    return balanceApi
      .get()
      .then((b) => {
        setBalance(b.balance);
        if (b.balance >= verifyCost) setOutOfCredits(false);
        return b.balance;
      })
      .catch(() => {
        setBalance(null);
        return null;
      })
      .finally(() => setBalanceLoading(false));
  }, [verifyCost]);

  const loadCriteria = useCallback(() => {
    criteriaApi.enrolled().then((list) => {
      setEnrolled(list);
      if (list[0]) setCriteriaId(list[0].criteria_id);
    });
  }, []);

  useEffect(() => {
    loadCriteria();
    loadBalance();
  }, [loadCriteria, loadBalance]);

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

  const noCredits = balance !== null && balance < verifyCost;
  const noEnrolled = enrolled.length === 0;

  const submit = async () => {
    if (!criteriaId) return setError("Select an enrolled criteria pack");
    if (files.length < 1) return setError("Upload at least 1 image (max 5)");
    if (noCredits) {
      setOutOfCredits(true);
      return;
    }

    setError("");
    setOutOfCredits(false);
    setLoading(true);
    try {
      const res = await verifyApi.upload(criteriaId, files);
      onVerified?.(res);
      reset();
      if (res.balance_remaining !== undefined) {
        setBalance(res.balance_remaining);
      } else {
        await loadBalance();
      }
    } catch (e: unknown) {
      if (isInsufficientCredits(e)) {
        setOutOfCredits(true);
        setBalance(0);
        setError("");
      } else {
        setError(formatApiError(e));
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
        Upload 1 to 5 images. Uses {verifyCost} credits per run. We extract fields, run your rules, and sign on Tron if it passes.
      </p>

      <CreditsStatus balance={balance} loading={balanceLoading} cost={verifyCost} />

      {showCreditsAlert && balance !== null && (
        <CreditsAlert balance={balance} cost={verifyCost} blocked={outOfCredits && !noCredits} />
      )}

      {noEnrolled && (
        <p className="auth-error">
          No criteria enrolled yet.{" "}
          <Link href="/criteria" className="dash-text-link">
            Enroll a pack
          </Link>{" "}
          before verifying.
        </p>
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
          disabled={noCredits || noEnrolled}
        >
          {enrolled.map((c) => (
            <option key={c.enroll_id} value={c.criteria_id}>
              {c.data.name} ({c.data.category})
            </option>
          ))}
        </select>
      </div>

      <div className={`upload-zone${noCredits || noEnrolled ? " upload-zone--disabled" : ""}`}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          multiple
          onChange={onFiles}
          className="upload-input"
          id="doc-file-upload"
          disabled={noCredits || noEnrolled}
        />
        <label
          htmlFor="doc-file-upload"
          className={`upload-label${noCredits || noEnrolled ? " upload-label--disabled" : ""}`}
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
          disabled={loading || noCredits || noEnrolled}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Analyzing…
            </>
          ) : noCredits ? (
            "Add credits to verify"
          ) : (
            `Run verification (${verifyCost} credits)`
          )}
        </button>
        {noEnrolled && (
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
