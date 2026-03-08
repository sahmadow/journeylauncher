import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getAllArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Blog — Journey Launcher",
  description:
    "CRM lifecycle marketing insights, email automation strategies, and customer journey best practices.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — Journey Launcher",
    description:
      "CRM lifecycle marketing insights, email automation strategies, and customer journey best practices.",
    url: "https://www.journeylauncher.com/blog",
    type: "website",
  },
};

export default function BlogPage() {
  const articles = getAllArticles();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1248px] px-6 py-20 md:py-28">
        <header className="mb-16">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Blog
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            CRM & Lifecycle Marketing Insights
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Practical guides on building automated customer journeys, email
            sequences, and retention systems.
          </p>
        </header>

        {articles.length === 0 ? (
          <p className="text-muted-foreground">No articles yet. Check back soon.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group rounded-lg border border-border p-6 transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                <h2 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-[#0F2A33]">
                  {article.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {article.description}
                </p>
                {article.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
