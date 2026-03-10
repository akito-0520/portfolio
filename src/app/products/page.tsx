import { getMarkdownList } from "@/lib/markdown";

export default function ProductsPage() {
  const products = getMarkdownList("products");

  return (
    <div>
      <h1 className="mb-10 text-2xl font-semibold tracking-tight text-zinc-900">
        Products
      </h1>
      {products.length === 0 ? (
        <p className="text-zinc-400">制作物はまだありません。</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {products.map((product) => (
            <li
              key={product.slug}
              className="rounded-lg border border-zinc-100 p-5"
            >
              <h2 className="font-medium text-zinc-900">{product.title}</h2>
              {product.description && (
                <p className="mt-2 line-clamp-3 text-sm text-zinc-500">
                  {product.description}
                </p>
              )}
              {product.url && (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs text-zinc-400 transition-colors hover:text-zinc-600"
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
