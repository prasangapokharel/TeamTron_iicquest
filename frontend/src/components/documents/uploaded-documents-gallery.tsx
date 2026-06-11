"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Loader2, X, ZoomIn } from "lucide-react";
import { fetchDocumentFile, fileNameFromPath } from "@/lib/document-files";

interface UploadedDocumentsGalleryProps {
  enrollId: string;
  paths: string[];
  variant?: "compact" | "large";
}

function DocumentImage({
  enrollId,
  index,
  total,
  name,
  variant,
  onExpand,
}: {
  enrollId: string;
  index: number;
  total: number;
  name: string;
  variant: "compact" | "large";
  onExpand: (index: number) => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    setLoading(true);
    setError(false);

    fetchDocumentFile(enrollId, index)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [enrollId, index]);

  return (
    <figure className="uploaded-doc-card">
      <button
        type="button"
        className={`uploaded-doc-preview uploaded-doc-preview--${variant}`}
        onClick={() => src && onExpand(index)}
        disabled={!src || loading || error}
        aria-label={`View document ${index + 1} of ${total}`}
      >
        <span className="uploaded-doc-index">Doc {index + 1}/{total}</span>
        {loading && (
          <div className="uploaded-doc-placeholder">
            <Loader2 size={20} className="animate-spin" />
          </div>
        )}
        {error && !loading && (
          <div className="uploaded-doc-placeholder uploaded-doc-placeholder--error">
            <ImageIcon size={20} />
            <span>Could not load</span>
          </div>
        )}
        {src && !loading && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Document ${index + 1}`} className="uploaded-doc-img" />
            <span className="uploaded-doc-zoom-hint">
              <ZoomIn size={14} />
              View full
            </span>
          </>
        )}
      </button>
      <figcaption className="uploaded-doc-caption" title={name}>
        <span className="uploaded-doc-caption-label">Document {index + 1}</span>
        <span className="uploaded-doc-caption-name">{name}</span>
      </figcaption>
    </figure>
  );
}

export function UploadedDocumentsGallery({
  enrollId,
  paths,
  variant = "compact",
}: UploadedDocumentsGalleryProps) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [expandedSrc, setExpandedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (expanded === null) {
      setExpandedSrc(null);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    fetchDocumentFile(enrollId, expanded)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setExpandedSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setExpandedSrc(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [enrollId, expanded]);

  if (!paths.length) return null;

  return (
    <>
      <section className="card result-section">
        <h3 className="result-section-title">Uploaded documents</h3>
        <p className="settings-section-desc uploaded-doc-desc">
          {paths.length} file{paths.length === 1 ? "" : "s"} submitted — click any image to view full size
        </p>
        <div className={`uploaded-doc-grid uploaded-doc-grid--${variant}`}>
          {paths.map((path, i) => (
            <DocumentImage
              key={`${path}-${i}`}
              enrollId={enrollId}
              index={i}
              total={paths.length}
              name={fileNameFromPath(path)}
              variant={variant}
              onExpand={setExpanded}
            />
          ))}
        </div>
      </section>

      {expanded !== null && (
        <div className="uploaded-doc-lightbox" onClick={() => setExpanded(null)} role="presentation">
          <div
            className="uploaded-doc-lightbox-inner"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={`Document ${expanded + 1} full view`}
          >
            <button
              type="button"
              className="uploaded-doc-lightbox-close"
              onClick={() => setExpanded(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <p className="uploaded-doc-lightbox-title">
              Document {expanded + 1} of {paths.length}
            </p>
            {expandedSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={expandedSrc}
                alt={`Document ${expanded + 1} full size`}
                className="uploaded-doc-lightbox-img"
              />
            ) : (
              <div className="uploaded-doc-placeholder">
                <Loader2 size={24} className="animate-spin" />
              </div>
            )}
            <p className="uploaded-doc-lightbox-caption">{fileNameFromPath(paths[expanded])}</p>
          </div>
        </div>
      )}
    </>
  );
}
