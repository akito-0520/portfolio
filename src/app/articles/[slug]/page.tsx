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
        className="text-sm text-zinc-400 transition-colors hover:text-zinc-600"
      >
        ← Articles
      </Link>
      <div className="mt-8">
        <p className="text-xs text-zinc-400">{frontMatter!.date}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
          {frontMatter!.title}
        </h1>
      </div>
      <article
        className="prose prose-zinc mt-10 max-w-none"
        dangerouslySetInnerHTML={{ __html: html! }}
      />
    </div>
  );
}
