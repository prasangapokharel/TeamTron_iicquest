"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ArrowUpRight } from "lucide-react";
import { API_BASE, API_ORIGIN } from "@/lib/config";
import type { CriteriaEnroll } from "@/types/api";

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="api-doc-code">
      {label && <div className="api-doc-code-label">{label}</div>}
      <div className="api-doc-code-row">
        <pre>{code}</pre>
        <button type="button" className="api-doc-copy" onClick={copy} aria-label="Copy code">
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

const SAMPLE_RESPONSE = `{
  "verdict": "green",
  "risk_score": 92,
  "status": "verified",
  "document_enroll_id": "uuid-here",
  "extracted_fields": { "full_name": "...", "citizenship_no": "..." },
  "flags": [{ "field": "...", "severity": "green", "message": "..." }],
  "tron_signed": true,
  "verify_url": "https://nile.tronscan.org/#/transaction/..."
}`;

export function ApiDocsPanel({ enrolled }: { enrolled: CriteriaEnroll[] }) {
  const sampleCriteriaId = enrolled[0]?.criteria_id ?? "YOUR_CRITERIA_ID";
  const sampleCriteriaName = enrolled[0]?.data?.name ?? "Bank KYC";

  const curlUpload = `curl -X POST "${API_BASE}/verify/upload" \\
  -H "X-Api-Key: YOUR_API_KEY" \\
  -F "criteria_id=${sampleCriteriaId}" \\
  -F "files=@/path/to/document-front.jpg" \\
  -F "files=@/path/to/document-back.jpg"`;

  const curlJson = `curl -X POST "${API_BASE}/verify" \\
  -H "X-Api-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "criteria_id": "${sampleCriteriaId}",
    "paths": ["uploads/your-company/doc1.jpg"]
  }'`;

  const fetchExample = `const form = new FormData();
form.append("criteria_id", "${sampleCriteriaId}");
form.append("files", fileInput.files[0]);

const res = await fetch("${API_BASE}/verify/upload", {
  method: "POST",
  headers: { "X-Api-Key": process.env.VIVADX_API_KEY },
  body: form,
});
const data = await res.json();`;

  const steps = [
    {
      n: 1,
      title: "Enroll a criteria pack",
      body: (
        <>
          Go to{" "}
          <Link href="/criteria" className="api-doc-link">
            Criteria <ArrowUpRight size={12} />
          </Link>{" "}
          and enroll a rule pack (e.g. Bank KYC, Manpower). Copy the criteria UUID — you need it on every verify call.
        </>
      ),
    },
    {
      n: 2,
      title: "Top up credits",
      body: (
        <>
          Each verification costs <strong>1 credit</strong>. Add credits on the{" "}
          <Link href="/settings/balance" className="api-doc-link">
            Balance <ArrowUpRight size={12} />
          </Link>{" "}
          page before calling the API in production or demo.
        </>
      ),
    },
    {
      n: 3,
      title: "Generate an API key",
      body: (
        <>
          Click <strong>Generate key</strong> above. Copy the key immediately — it is only shown once. Store it in your
          server environment (never in frontend code).
        </>
      ),
    },
    {
      n: 4,
      title: "Send a verify request",
      body: (
        <>
          Use <code>POST {API_BASE}/verify/upload</code> with header{" "}
          <code>X-Api-Key</code>, form field <code>criteria_id</code>, and 1–5 image files (JPG/PNG).
        </>
      ),
    },
    {
      n: 5,
      title: "Handle the response",
      body: (
        <>
          You receive <code>verdict</code> (green / orange / red), <code>risk_score</code> (0–100), extracted fields,
          flags, and <code>verify_url</code> when signed on Tron. Poll or store <code>document_enroll_id</code> for
          later lookups.
        </>
      ),
    },
  ];

  return (
    <div className="api-docs-panel">
      <div className="api-docs-intro">
        <h2 className="settings-section-title">Integration guide</h2>
        <p className="settings-section-desc">
          Step-by-step flow for server-to-server document verification via the VivadX REST API.
          Base URL: <code>{API_ORIGIN}</code>
        </p>
      </div>

      <ol className="api-doc-steps">
        {steps.map((s) => (
          <li key={s.n} className="api-doc-step">
            <span className="api-doc-step-num">{s.n}</span>
            <div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      {enrolled.length > 0 && (
        <div className="api-doc-criteria">
          <h3 className="api-doc-section-title">Your enrolled criteria</h3>
          <div className="api-doc-criteria-list">
            {enrolled.map((c) => (
              <div key={c.enroll_id} className="api-doc-criteria-item">
                <span>{c.data?.name ?? "Criteria"}</span>
                <code>{c.criteria_id}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="api-doc-endpoints">
        <h3 className="api-doc-section-title">Endpoints</h3>
        <table className="api-doc-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Path</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="badge badge-ignored">POST</span></td>
              <td><code>/api/v1/verify/upload</code></td>
              <td>Upload images + verify (recommended)</td>
            </tr>
            <tr>
              <td><span className="badge badge-ignored">POST</span></td>
              <td><code>/api/v1/verify</code></td>
              <td>Verify already-uploaded file paths (JSON)</td>
            </tr>
            <tr>
              <td><span className="badge badge-ignored">GET</span></td>
              <td><code>/api/v1/document/{"{enroll_id}"}/result</code></td>
              <td>Fetch full result by enrollment ID</td>
            </tr>
            <tr>
              <td><span className="badge badge-ignored">GET</span></td>
              <td><code>/api/v1/signature/verify/{"{txid}"}</code></td>
              <td>Public blockchain proof lookup (no auth)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="api-doc-examples">
        <h3 className="api-doc-section-title">Code examples</h3>
        <p className="api-doc-example-note">
          Replace <code>YOUR_API_KEY</code> with the key you generated. Example uses{" "}
          <strong>{sampleCriteriaName}</strong> criteria ID.
        </p>
        <CodeBlock code={curlUpload} label="cURL — upload & verify" />
        <CodeBlock code={curlJson} label="cURL — JSON paths" />
        <CodeBlock code={fetchExample} label="JavaScript (fetch)" />
        <CodeBlock code={SAMPLE_RESPONSE} label="Sample response" />
      </div>

      <div className="api-doc-auth">
        <h3 className="api-doc-section-title">Authentication</h3>
        <ul className="balance-info-list">
          <li>Send <code>X-Api-Key: your_key</code> on every request (server-side only).</li>
          <li>Alternatively use <code>Authorization: Bearer JWT</code> from login — for dashboard, not integrations.</li>
          <li>Revoked keys return <code>401 Invalid or revoked API key</code> immediately.</li>
          <li>Insufficient credits return an error — top up on Balance first.</li>
        </ul>
      </div>
    </div>
  );
}
