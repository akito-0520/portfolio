type Product = {
  title: string;
  description: string;
  url?: string;
};

type Props = {
  title?: string;
  products?: Product[];
};

export default function ProductsSection({
  title = "Products",
  products = [],
}: Props) {
  return (
    <section>
      <h2 className="mb-8 text-xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <ul className="space-y-4">
        {products.map((product) => (
          <li
            key={product.title}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{product.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {product.description}
                </p>
              </div>
              {product.url && (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-sm text-slate-500 underline underline-offset-2 hover:text-slate-800"
                >
                  Link →
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
