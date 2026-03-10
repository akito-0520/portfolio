import { getMarkdownList } from "@/lib/markdown";

export default function AwardsPage() {
  const awards = getMarkdownList("awards");

  return (
    <div>
      <h1 className="mb-10 text-2xl font-bold tracking-tight text-slate-900">
        Awards
      </h1>
      {awards.length === 0 ? (
        <p className="text-sm text-slate-400">受賞歴はまだありません。</p>
      ) : (
        <ul className="space-y-6">
          {awards.map((award) => (
            <li
              key={award.slug}
              className="rounded-lg border border-slate-200 p-5"
            >
              <p className="text-xs font-medium text-slate-400">{award.date}</p>
              <h2 className="mt-1 text-base font-semibold text-slate-900">
                {award.title}
              </h2>
              {award.organization && (
                <p className="mt-0.5 text-sm font-medium text-blue-600">
                  {award.organization}
                </p>
              )}
              {award.description && (
                <p className="mt-2 text-sm text-slate-500">
                  {award.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
