"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ExternalLink, ArrowLeft } from "lucide-react";
import { signatureApi } from "@/lib/api";
import { formatApiError } from "@/lib/errors";
import type { TxVerifyResponse } from "@/types/api";
import { Logo } from "@/components/ui/Logo";

export default function PublicVerifyPage() {
  const { txid } = useParams<{ txid: string }>();
  const [data, setData] = useState<TxVerifyResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (txid) {
      signatureApi.verifyTx(txid).then(setData).catch((e) => setError(formatApiError(e)));
    }
  }, [txid]);

  return (
    <div className="auth-page min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="flex justify-center mb-8"><Logo /></div>
        <div className="card p-8">
          <div className="flex items-center gap-2 text-[var(--primary)] mb-4">
            <ShieldCheck size={24} />
            <h1 className="text-xl font-semibold">Public Blockchain Verify</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Anyone can check this hash on Tron. No login needed.
          </p>

          {error && <p className="auth-error">{error}</p>}

          {data && (
            <div className="result-mono-block">
              <p><span>Status</span>{data.status}</p>
              <p><span>TXID</span>{data.txid}</p>
              <p><span>Hash (memo)</span>{data.hash || "n/a"}</p>
              <a
                href={data.verify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="tron-link mt-4"
              >
                Open TronScan <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
        <Link href="/" className="auth-back-home mt-6 inline-flex">
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>
    </div>
  );
}
