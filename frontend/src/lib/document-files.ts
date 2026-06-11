import { API_BASE } from "./config";
import { getToken } from "./auth";
import { ApiRequestError } from "./errors";

/** Fetch an uploaded document image (auth required). */
export async function fetchDocumentFile(enrollId: string, fileIndex: number): Promise<Blob> {
  const token = getToken();
  if (!token) throw new ApiRequestError("Not authenticated", 401);

  const res = await fetch(`${API_BASE}/document/${enrollId}/file/${fileIndex}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    let message = "Could not load image";
    try {
      const data = await res.json();
      message = typeof data.detail === "string" ? data.detail : message;
    } catch {
      /* ignore */
    }
    throw new ApiRequestError(message, res.status);
  }

  return res.blob();
}

export function fileNameFromPath(path: string): string {
  return path.split("/").pop() ?? path;
}
