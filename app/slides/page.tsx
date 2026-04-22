import { getSlideList } from "../../lib/slides";
import Link from "next/link";

export default function SlidesPage() {
  const slides = getSlideList();

  return (
    <div>
      <h1 className="mb-10 text-2xl font-bold tracking-tight text-slate-900">
        Slides
      </h1>
      {slides.length === 0 ? (
        <p className="text-sm text-slate-400">スライドはまだありません。</p>
      ) : (
        <ul className="space-y-6">
          {slides.map((slide) => (
            <li key={slide.slug}>
              <Link
                href={`/slides/${slide.slug}`}
                className="group flex flex-col gap-2 rounded-lg border border-slate-200 p-5 transition-shadow hover:shadow-md"
              >
                <h2 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                  {slide.title}
                </h2>
                {slide.description && (
                  <p className="line-clamp-2 text-sm text-slate-500">
                    {slide.description}
                  </p>
                )}
                {slide.date && (
                  <span className="text-xs text-slate-400">{slide.date}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
