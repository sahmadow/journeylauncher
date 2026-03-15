export interface ScrapedData {
  url: string;
  title: string;
  meta_description: string;
  logo_url: string;
  colors: string[];
  headings: string[];
  body_text: string;
  pricing_text: string;
}

export type BusinessType = "saas" | "ecommerce" | "service";

export interface BusinessModel {
  has_free_trial: boolean;
  has_pricing_page: boolean;
  offers_consultation: boolean;
  has_product_catalog: boolean;
  has_booking_system: boolean;
  subscription_based: boolean;
}

export interface Analysis {
  tone: string;
  usp: string;
  features: string[];
  target_audience: string;
  pricing_summary: string | null;
  brand_personality: string;
  business_type: BusinessType;
  business_model: BusinessModel;
}

export interface LifecycleSignal {
  category: string;
  signal: string;
  description: string;
}

export interface WebhookSummary {
  signals?: LifecycleSignal[];
  webhooks: { source: string; event: string; description: string }[];
  polling: { source: string; frequency: string; description: string }[];
  summary: string;
}

export type ScoreValue = 0 | 1 | 2;
export type DataAvailability = "all" | "some" | "none";

export type LifecycleStage =
  | "Early Engagement"
  | "Engagement"
  | "Monetisation"
  | "Retention";

export interface FlowNode {
  id: string;
  type: "trigger" | "email" | "wait" | "condition" | "push" | "in_app";
  label?: string;
  description?: string;
  subject?: string;
  preview_text?: string;
  body_html?: string;
  cta_text?: string;
  cta_url?: string;
  duration?: string;
  condition?: string;
  yes_label?: string;
  no_label?: string;
}

export interface FlowStage {
  stage: string;
  name?: string;
  stage_name?: string;
  description: string;
  nodes: FlowNode[];
}

export interface GeneratedFlow {
  stages: FlowStage[];
}

// --- EmailGen Engine types ---

export interface BrandConfig {
  logo_url: string;
  primary_color: string;
  secondary_color?: string;
  accent_color?: string;
  font_family: string;
  header_style: "logo-only" | "logo-tagline" | "logo-nav";
  footer_content: string;
  social_links?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
  cta_style: "rounded" | "pill" | "square";
  template_style: "minimal" | "editorial" | "promotional";
  hero_image_url?: string;
  tone_override?: string;
  sender_name: string;
  sender_address?: string;
}

export interface GeneratedEmail {
  node_id: string;
  stage_name: string;
  subject: string;
  html: string;
  status: "pending" | "generating" | "ready" | "error";
  error_message?: string;
}

export interface EmailGenState {
  brand_config: BrandConfig | null;
  generated_emails: GeneratedEmail[];
  generation_status: "idle" | "generating" | "complete" | "error";
  panel_open: boolean;
}

export interface WizardState {
  currentScreen: number;
  landingPageUrl: string;
  scrapedData: ScrapedData | null;
  analysis: Analysis | null;
  businessDesc: string;
  clmScore: ScoreValue | null;
  personalisationScore: ScoreValue | null;
  dataAvailability: DataAvailability | null;
  lifecycleGaps: LifecycleStage[];
  dataSources: string[];
  dataSourceOther: string;
  businessTypeOverride: BusinessType | null;
  webhookSummary: WebhookSummary | null;
  generatedFlow: GeneratedFlow | null;
  isLoading: boolean;
  error: string | null;
  email: string;
  emailGenState?: EmailGenState;
}

export const INITIAL_WIZARD_STATE: WizardState = {
  currentScreen: 1,
  landingPageUrl: "",
  scrapedData: null,
  analysis: null,
  businessDesc: "",
  clmScore: null,
  personalisationScore: null,
  dataAvailability: null,
  lifecycleGaps: [
    "Early Engagement",
    "Engagement",
    "Monetisation",
    "Retention",
  ],
  dataSources: [],
  dataSourceOther: "",
  businessTypeOverride: null,
  webhookSummary: null,
  generatedFlow: null,
  isLoading: false,
  error: null,
  email: "",
};
