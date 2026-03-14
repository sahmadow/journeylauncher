export function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escAttr(s: string): string {
  return escHtml(s);
}

export function sanitizeUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return escAttr(trimmed);
  }
  return "";
}
