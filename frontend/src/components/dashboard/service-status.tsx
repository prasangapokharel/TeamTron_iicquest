"use client";

import { useEffect, useState } from "react";
import { healthApi } from "@/lib/api";

export function ServiceStatus() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    healthApi
      .check()
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
  }, []);

  if (online === null) return null;

  return (
    <p className="service-status" role="status">
      <span className={`service-status-dot${online ? " service-status-dot--ok" : ""}`} />
      API {online ? "online" : "offline"}
    </p>
  );
}
