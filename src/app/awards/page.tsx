import { getMarkdownList } from "@/lib/markdown";

export default function AwardsPage() {
  const awards = getMarkdownList("awards");

  return (
    <div>
      <h1 className="mb-10 text-2xl font-semibold tracking-tight text-zinc-900">
        Awards
      </h1>
      {awards.length === 0 ? (
        <p className="text-zinc-400">受賞歴はまだありません。</p>
      ) : (
        <ul className="space-y-8">
          {awards.map((award) => (
            <li key={award.slug} className="border-l-2 border-zinc-100 pl-5">
              <p className="text-xs text-zinc-400">{award.date}</p>
              <h2 className="mt-1 text-lg font-medium text-zinc-900">
                {award.title}
              </h2>
              {award.organization && (
                <p className="mt-0.5 text-sm text-zinc-500">
                  {award.organization}
                </p>
              )}
              {award.description && (
                <p className="mt-2 text-sm text-zinc-500">
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
