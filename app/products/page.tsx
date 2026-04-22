import { getMarkdownList } from "../../lib/markdown";

export default function ProductsPage() {
  const products = getMarkdownList("products");

  return (
    <div>
      <h1 className="mb-10 text-2xl font-bold tracking-tight text-slate-900">
        Products
      </h1>
      {products.length === 0 ? (
        <p className="text-sm text-slate-400">制作物はまだありません。</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {products.map((product) => (
            <li
              key={product.slug}
              className="flex flex-col rounded-lg border border-slate-200 p-5 transition-shadow hover:shadow-md"
            >
              <h2 className="text-sm font-semibold text-slate-900">
                {product.title}
              </h2>
              {product.description && (
                <p className="mt-2 line-clamp-3 grow text-sm text-slate-500">
                  {product.description}
                </p>
              )}
              {product.url && (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-xs font-medium text-blue-600 transition-colors hover:text-blue-800"
                >
                  リンク →
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
