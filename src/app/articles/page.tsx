import { getMarkdownList } from "@/lib/markdown";
import Link from "next/link";

export default function ArticlesPage() {
  const articles = getMarkdownList("articles");

  return (
    <div>
      <h1 className="mb-10 text-2xl font-semibold tracking-tight text-zinc-900">
        Articles
      </h1>
      {articles.length === 0 ? (
        <p className="text-zinc-400">記事はまだありません。</p>
      ) : (
        <ul className="space-y-8">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link href={`/articles/${article.slug}`} className="group block">
                <p className="text-xs text-zinc-400">{article.date}</p>
                <h2 className="mt-1 text-lg font-medium text-zinc-900 transition-colors group-hover:text-zinc-600">
                  {article.title}
                </h2>
                {article.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                    {article.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
