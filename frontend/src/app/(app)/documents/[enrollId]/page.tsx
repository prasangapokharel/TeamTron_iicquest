"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DocumentDetailPage() {
  const { enrollId } = useParams<{ enrollId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (enrollId) {
      router.replace(`/documents/${enrollId}/result`);
    }
  }, [enrollId, router]);

  return (
    <div className="dash-content dash-content--saas">
      <div className="dash-loading-inline"><div className="dash-spinner" /></div>
    </div>
  );
}
