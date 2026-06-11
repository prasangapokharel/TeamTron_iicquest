"use client";

import { useState } from "react";
import { Loader2, ScanSearch } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { SpoofImageSlot } from "@/components/spoofing/spoof-image-slot";
import { SpoofingResult } from "@/components/spoofing/spoofing-result";
import { documentApi } from "@/lib/api";
import { formatApiError } from "@/lib/errors";
import type { SpoofingVerifyResponse } from "@/types/api";

export default function SpoofingPage() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SpoofingVerifyResponse | null>(null);

  const compare = async () => {
    if (!fileA || !fileB) {
      setError("Upload both Image A and Image B before comparing.");
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await documentApi.spoofingVerify(fileA, fileB);
      setResult(data);
    } catch (e: unknown) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = Boolean(fileA && fileB) && !loading;

  return (
    <div className="dash-content dash-content--saas">
      <PageHeader
        title="Document spoofing check"
        description="Compare a claimed verified document (Image A) with the copy being presented (Image B). Detects when a previously verified file does not match the presented image."
      />

      {error && (
        <div className="settings-alerts">
          <p className="auth-error">{error}</p>
        </div>
      )}

      <div className="spoofing-page">
        <div className="spoofing-upload-grid">
          <SpoofImageSlot
            label="Image A — Reference"
            hint="The document that was supposedly verified by VivadX"
            file={fileA}
            onChange={setFileA}
            disabled={loading}
          />
          <SpoofImageSlot
            label="Image B — Presented"
            hint="The document being presented at the counter or desk now"
            file={fileB}
            onChange={setFileB}
            disabled={loading}
          />
        </div>

        <div className="spoofing-actions">
          <button
            type="button"
            className="dash-btn dash-btn--primary"
            onClick={compare}
            disabled={!canSubmit}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Comparing…
              </>
            ) : (
              <>
                <ScanSearch size={16} />
                Compare documents
              </>
            )}
          </button>
        </div>

        {result && <SpoofingResult data={result} />}
      </div>
    </div>
  );
}
