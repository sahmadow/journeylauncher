import { ScrapedData, Analysis, WebhookSummary, GeneratedFlow } from "@/types";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  return res.json();
}

export async function scrapePage(url: string) {
  return request<{ scraped_data: ScrapedData; analysis: Analysis }>(
    "/api/scrape",
    { method: "POST", body: JSON.stringify({ url }) }
  );
}

export async function analyzeSources(dataSources: string[], businessDesc: string) {
  return request<{ webhook_summary: WebhookSummary }>(
    "/api/analyze",
    { method: "POST", body: JSON.stringify({ data_sources: dataSources, business_desc: businessDesc }) }
  );
}

export async function generateFlow(data: {
  scraped_data: ScrapedData | null;
  business_desc: string;
  lifecycle_gaps: string[];
  analysis: Analysis | null;
}) {
  return request<{ flow: GeneratedFlow }>(
    "/api/generate-flow",
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function saveSubmission(data: Record<string, unknown>) {
  return request<{ id: string }>(
    "/api/submissions",
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function captureEmail(email: string, submissionId?: string) {
  return request<{ success: boolean }>(
    "/api/submissions",
    { method: "POST", body: JSON.stringify({ email, submission_id: submissionId }) }
  );
}
