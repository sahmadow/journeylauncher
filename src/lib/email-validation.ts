export interface ValidationWarning {
  id: string;
  message: string;
  severity: "warning" | "info";
}

export function validateEmailHtml(html: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (!html.includes("<!DOCTYPE")) {
    warnings.push({ id: "doctype", message: "Missing <!DOCTYPE html> declaration", severity: "warning" });
  }

  if (!html.includes("<html") || !html.includes("<head") || !html.includes("<body")) {
    warnings.push({ id: "structure", message: "Missing <html>, <head>, or <body> structure", severity: "warning" });
  }

  if (!html.includes("<table")) {
    warnings.push({ id: "tables", message: "No table-based layout detected — may render poorly in some ESPs", severity: "warning" });
  }

  if (/<style[\s>]/i.test(html)) {
    warnings.push({ id: "style-block", message: "Contains <style> block — some ESPs strip these", severity: "info" });
  }

  if (/<img(?![^>]*alt=)[^>]*>/i.test(html)) {
    warnings.push({ id: "alt-text", message: "Some images may be missing alt attributes", severity: "info" });
  }

  if (!html.includes("{{unsubscribe_url}}") && !html.includes("unsubscribe")) {
    warnings.push({ id: "unsubscribe", message: "No unsubscribe link placeholder found", severity: "warning" });
  }

  const sizeKb = new Blob([html]).size / 1024;
  if (sizeKb > 100) {
    warnings.push({ id: "size", message: `Email HTML is ${Math.round(sizeKb)}KB — over 100KB may get clipped`, severity: "warning" });
  }

  if (/<script[\s>]/i.test(html)) {
    warnings.push({ id: "javascript", message: "Contains JavaScript — ESPs will strip this", severity: "warning" });
  }

  if (/<link[^>]*rel=["']stylesheet/i.test(html)) {
    warnings.push({ id: "external-css", message: "Contains external CSS references — may not load in ESPs", severity: "warning" });
  }

  if (!html.includes("charset") && !html.includes("UTF-8")) {
    warnings.push({ id: "charset", message: "Missing charset=UTF-8 meta tag", severity: "info" });
  }

  return warnings;
}
