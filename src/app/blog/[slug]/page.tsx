import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getArticleBySlug, getAllSlugs } from "@/lib/articles";
import { FunnelDiagram } from "@/components/blog/FunnelDiagram";
import { ObjectivesGrid } from "@/components/blog/ObjectivesGrid";
import { AgenticGrid } from "@/components/blog/AgenticGrid";

const mdxComponents = {
  FunnelDiagram,
  ObjectivesGrid,
  AgenticGrid,
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: `${article.title} — Journey Launcher`,
    description: article.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://www.journeylauncher.com/blog/${slug}`,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    author: {
      "@type": "Organization",
      name: article.author,
      url: "https://www.journeylauncher.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Journey Launcher",
      url: "https://www.journeylauncher.com",
    },
    mainEntityOfPage: `https://www.journeylauncher.com/blog/${slug}`,
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1248px] px-6 py-20 md:py-28">
        <Script
          id={`article-schema-${slug}`}
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {structuredData}
        </Script>

        <div className="mx-auto max-w-prose">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            &larr; Back to Blog
          </Link>

          <header className="mt-8 mb-12">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <time dateTime={article.date}>
                {new Date(article.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span>&middot;</span>
              <span>{article.readingTime}</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              {article.title}
            </h1>
            {article.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <article className="prose prose-neutral max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#0F2A33] prose-a:underline-offset-4 hover:prose-a:text-[#1a3d4a]">
            <MDXRemote source={article.content} components={mdxComponents} />
          </article>

          <footer className="mt-16 border-t border-border pt-8">
            <div className="rounded-lg bg-secondary p-6">
              <h3 className="text-lg font-semibold">
                Generate your free CRM lifecycle flow
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get personalised CRM recommendations for your business in
                minutes.
              </p>
              <Link
                href="/flow"
                className="mt-4 inline-block rounded-lg bg-[#0F2A33] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a3d4a]"
              >
                Try the Free Tool
              </Link>
            </div>
          </footer>
        </div>
      </main>
      <Footer />
    </>
  );
}
