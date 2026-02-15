import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Journey Launcher — CRM & Lifecycle Marketing Consultancy",
  description:
    "We build personalised CRM flows and lifecycle marketing systems. Generate free CRM recommendations for your business.",
  metadataBase: new URL("https://www.journeylauncher.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://www.journeylauncher.com/",
    title: "Journey Launcher — CRM & Lifecycle Marketing Consultancy",
    description:
      "We build personalised CRM flows and lifecycle marketing systems. Generate free CRM recommendations for your business.",
    siteName: "Journey Launcher",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Journey Launcher — CRM & Lifecycle Marketing Consultancy",
    description:
      "We build personalised CRM flows and lifecycle marketing systems.",
  },
  icons: {
    icon: "/logo-new.svg",
    apple: "/apple-touch-icon.png",
  },
};

// Static structured data — hardcoded, no user input, safe from XSS
const STRUCTURED_DATA_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.journeylauncher.com/#organization",
      name: "Journey Launcher",
      url: "https://www.journeylauncher.com",
    },
    {
      "@type": "WebSite",
      "@id": "https://www.journeylauncher.com/#website",
      url: "https://www.journeylauncher.com",
      name: "Journey Launcher",
      publisher: {
        "@id": "https://www.journeylauncher.com/#organization",
      },
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://www.journeylauncher.com/#service",
      name: "Journey Launcher",
      description:
        "CRM and lifecycle marketing consultancy helping businesses build personalised customer journeys.",
      url: "https://www.journeylauncher.com",
      areaServed: "Worldwide",
      serviceType: [
        "CRM Consulting",
        "Lifecycle Marketing",
        "Email Automation",
        "Customer Journey Mapping",
      ],
    },
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {STRUCTURED_DATA_JSON}
        </Script>
      </head>
      <body className="antialiased">
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ETQ01QD1R6"
          strategy="afterInteractive"
        />
        <Script id="gtag" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-ETQ01QD1R6');`}
        </Script>
      </body>
    </html>
  );
}
