import { getMarkdownFile, getMarkdownList } from "../../../lib/markdown";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateStaticParams() {
  const articles = getMarkdownList("articles");
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let frontMatter: Record<string, string>;
  let html: string;

  try {
    ({ frontMatter, html } = await getMarkdownFile(`articles/${slug}.md`));
  } catch {
    notFound();
  }

  return (
    <div>
      <Link
        href="/articles"
        className="text-sm font-medium text-slate-400 transition-colors hover:text-blue-600"
      >
        ← Articles
      </Link>
      <div className="mt-8 border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {frontMatter!.title}
        </h1>
        {frontMatter!.description && (
          <p className="mt-2 text-slate-500">{frontMatter!.description}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {frontMatter!.createdAt && (
            <span className="text-xs font-medium text-slate-400">
              作成: {frontMatter!.createdAt}
            </span>
          )}
          {frontMatter!.updatedAt && (
            <span className="text-xs font-medium text-slate-400">
              更新: {frontMatter!.updatedAt}
            </span>
          )}
          {frontMatter!.author && (
            <span className="text-xs font-medium text-slate-400">
              {frontMatter!.author}
            </span>
          )}
          {frontMatter!.tags &&
            (Array.isArray(frontMatter!.tags)
              ? frontMatter!.tags
              : String(frontMatter!.tags).split(",")
            ).map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
              >
                {tag.trim()}
              </span>
            ))}
        </div>
      </div>
      <article
        className="prose prose-slate mt-10 max-w-none"
        dangerouslySetInnerHTML={{ __html: html! }}
      />
    </div>
  );
}
