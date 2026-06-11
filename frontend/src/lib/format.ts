/** Display category label from API (e.g. "bank" → "Bank"). */
export function formatCategoryLabel(category?: string | null): string {
  if (!category) return "n/a";
  return category
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
