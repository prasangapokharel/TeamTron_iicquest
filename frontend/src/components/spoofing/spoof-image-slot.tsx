"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SpoofImageSlot({
  label,
  hint,
  file,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;

    if (!ACCEPT.split(",").includes(picked.type)) {
      setError("Use JPG, PNG, or WebP");
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError("File must be under 10 MB");
      return;
    }

    setError("");
    onChange(picked);
  };

  return (
    <section className="card spoof-slot">
      <div className="spoof-slot-head">
        <h3 className="settings-section-title">{label}</h3>
        <p className="settings-section-desc">{hint}</p>
      </div>

      <div className={`upload-zone${disabled ? " upload-zone--disabled" : ""}`}>
        <input
          type="file"
          accept={ACCEPT}
          className="upload-input"
          onChange={pick}
          disabled={disabled}
          aria-label={label}
        />
        <div className={`upload-label${disabled ? " upload-label--disabled" : ""}`}>
          {preview ? (
            <img src={preview} alt="" className="spoof-slot-preview" />
          ) : (
            <>
              <Upload size={22} className="text-[var(--primary)]" />
              <span>Drop image or click to browse</span>
              <span className="text-xs text-[var(--text-muted)]">JPG, PNG, WebP · max 10 MB</span>
            </>
          )}
        </div>
      </div>

      {file && (
        <div className="spoof-slot-meta">
          <span className="spoof-slot-filename">
            <ImageIcon size={14} />
            {file.name}
          </span>
          <span className="text-xs text-[var(--text-muted)]">{formatSize(file.size)}</span>
          <button
            type="button"
            className="spoof-slot-clear"
            onClick={() => onChange(null)}
            disabled={disabled}
            aria-label="Remove file"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {error && <p className="auth-error mt-2 text-sm">{error}</p>}
    </section>
  );
}
