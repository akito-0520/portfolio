import { getSlide, getSlideList } from "@/lib/slides";
import PdfViewerClient from "@/components/PdfViewerClient";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getSlideList().map((s) => ({ slug: s.slug }));
}

export default async function SlidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const slide = getSlide(slug);
  if (!slide) notFound();

  return (
    <div>
      <Link
        href="/slides"
        className="text-sm font-medium text-slate-400 transition-colors hover:text-blue-600"
      >
        ← Slides
      </Link>
      <div className="mt-8 mb-8 border-b border-slate-200 pb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {slide.title}
        </h1>
        {slide.description && (
          <p className="mt-2 text-sm text-slate-500">{slide.description}</p>
        )}
        {slide.date && (
          <p className="mt-1 text-xs text-slate-400">{slide.date}</p>
        )}
      </div>
      <PdfViewerClient pdfUrl={`/slides/${slide.pdfFile}`} />
    </div>
  );
}
