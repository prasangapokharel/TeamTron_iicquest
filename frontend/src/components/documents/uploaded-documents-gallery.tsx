"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import { fetchDocumentFile, fileNameFromPath } from "@/lib/document-files";

interface UploadedDocumentsGalleryProps {
  enrollId: string;
  paths: string[];
}

function DocumentImage({ enrollId, index, name }: { enrollId: string; index: number; name: string }) {
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
      <div className="uploaded-doc-preview">
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
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`Uploaded document ${index + 1}`} className="uploaded-doc-img" />
        )}
      </div>
      <figcaption className="uploaded-doc-caption" title={name}>
        {name}
      </figcaption>
    </figure>
  );
}

export function UploadedDocumentsGallery({ enrollId, paths }: UploadedDocumentsGalleryProps) {
  if (!paths.length) return null;

  return (
    <section className="card result-section">
      <h3 className="result-section-title">Uploaded documents</h3>
      <p className="settings-section-desc uploaded-doc-desc">
        {paths.length} file{paths.length === 1 ? "" : "s"} submitted for this verification
      </p>
      <div className="uploaded-doc-grid">
        {paths.map((path, i) => (
          <DocumentImage
            key={`${path}-${i}`}
            enrollId={enrollId}
            index={i}
            name={fileNameFromPath(path)}
          />
        ))}
      </div>
    </section>
  );
}
