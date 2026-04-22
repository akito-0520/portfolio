"use client";

import { useEffect, useState } from "react";

export type Product = {
  slug: string;
  title?: string;
  description?: string;
  url?: string;
  html: string;
};

export default function ProductsList({ products }: { products: Product[] }) {
  const [active, setActive] = useState<Product | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active]);

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {products.map((product) => (
          <li key={product.slug}>
            <button
              type="button"
              onClick={() => setActive(product)}
              className="flex h-full w-full flex-col rounded-lg border border-slate-200 p-5 text-left transition-shadow hover:shadow-md"
            >
              <h2 className="text-sm font-semibold text-slate-900">
                {product.title}
              </h2>
              {product.description && (
                <p className="mt-2 line-clamp-3 grow text-sm text-slate-500">
                  {product.description}
                </p>
              )}
              <span className="mt-4 text-xs font-medium text-blue-600">
                詳細を見る →
              </span>
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="閉じる"
              onClick={() => setActive(null)}
              className="absolute top-4 right-4 text-xl leading-none text-slate-400 transition-colors hover:text-slate-600"
            >
              ×
            </button>
            <h2
              id="product-modal-title"
              className="pr-8 text-xl font-bold text-slate-900"
            >
              {active.title}
            </h2>
            {active.url && (
              <a
                href={active.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-medium break-all text-blue-600 transition-colors hover:text-blue-800"
              >
                {active.url} →
              </a>
            )}
            <div
              className="prose prose-slate mt-6 max-w-none"
              dangerouslySetInnerHTML={{ __html: active.html }}
            />
          </div>
        </div>
      )}
    </>
  );
}
