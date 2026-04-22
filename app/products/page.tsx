import { getMarkdownFile, getMarkdownList } from "../../lib/markdown";
import ProductsList, { type Product } from "./ProductsList";

export default async function ProductsPage() {
  const products = getMarkdownList("products");

  const productsWithHtml: Product[] = await Promise.all(
    products.map(async (p) => {
      const { html } = await getMarkdownFile(`products/${p.slug}.md`);
      return {
        slug: p.slug,
        title: p.title,
        description: p.description,
        url: p.url,
        html,
      };
    }),
  );

  return (
    <div>
      <h1 className="mb-10 text-2xl font-bold tracking-tight text-slate-900">
        Products
      </h1>
      {productsWithHtml.length === 0 ? (
        <p className="text-sm text-slate-400">制作物はまだありません。</p>
      ) : (
        <ProductsList products={productsWithHtml} />
      )}
    </div>
  );
}
