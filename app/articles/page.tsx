import { getMarkdownList } from "../../lib/markdown";
import Link from "next/link";

export default function ArticlesPage() {
  const articles = getMarkdownList("articles");

  return (
    <div>
      <h1 className="mb-10 text-2xl font-bold tracking-tight text-slate-900">
        Articles
      </h1>
      {articles.length === 0 ? (
        <p className="text-sm text-slate-400">記事はまだありません。</p>
      ) : (
        <ul className="space-y-6">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/articles/${article.slug}`}
                className="group flex flex-col gap-2 rounded-lg border border-slate-200 p-5 transition-shadow hover:shadow-md"
              >
                <h2 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                  {article.title}
                </h2>
                {article.description && (
                  <p className="line-clamp-2 text-sm text-slate-500">
                    {article.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {article.createdAt && (
                    <span className="text-xs text-slate-400">
                      作成: {article.createdAt}
                    </span>
                  )}
                  {article.updatedAt && (
                    <span className="text-xs text-slate-400">
                      更新: {article.updatedAt}
                    </span>
                  )}
                  {article.author && (
                    <span className="text-xs text-slate-400">
                      {article.author}
                    </span>
                  )}
                  {article.tags &&
                    (Array.isArray(article.tags)
                      ? article.tags
                      : String(article.tags).split(",")
                    ).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
