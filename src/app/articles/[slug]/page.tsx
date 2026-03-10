import { getMarkdownFile, getMarkdownList } from "@/lib/markdown";
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
        <p className="text-xs font-medium text-slate-400">
          {frontMatter!.date}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {frontMatter!.title}
        </h1>
      </div>
      <article
        className="prose prose-slate mt-10 max-w-none"
        dangerouslySetInnerHTML={{ __html: html! }}
      />
    </div>
  );
}
