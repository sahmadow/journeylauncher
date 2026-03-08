"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BlogCardCover } from "@/components/blog/BlogCardCover";
import type { ArticleMeta } from "@/lib/articles";

interface LatestArticlesProps {
  articles: ArticleMeta[];
}

export function LatestArticles({ articles }: LatestArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-[1248px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            From the Blog
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Latest Insights
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, i) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/blog/${article.slug}`}
                className="group block overflow-hidden rounded-xl border border-border transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <BlogCardCover
                  index={i}
                  cover={article.cover}
                  coverIcon={article.coverIcon}
                  tag={article.tags[0]}
                />
                <div className="p-6">
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
                  <h3 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-[#0F2A33]">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {article.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            View all articles &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
