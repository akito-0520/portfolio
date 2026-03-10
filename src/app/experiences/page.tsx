import { getMarkdownList } from "@/lib/markdown";

export default function ExperiencesPage() {
  const experiences = getMarkdownList("experiences");

  return (
    <div>
      <h1 className="mb-10 text-2xl font-bold tracking-tight text-slate-900">
        Experiences
      </h1>
      {experiences.length === 0 ? (
        <p className="text-sm text-slate-400">活動・経験はまだありません。</p>
      ) : (
        <ul className="space-y-6">
          {experiences.map((experience) => (
            <li
              key={experience.slug}
              className="rounded-lg border border-slate-200 p-5"
            >
              <p className="text-xs font-medium text-slate-400">
                {experience.date}
              </p>
              <h2 className="mt-1 text-base font-semibold text-slate-900">
                {experience.title}
              </h2>
              {experience.organization && (
                <p className="mt-0.5 text-sm font-medium text-blue-600">
                  {experience.organization}
                </p>
              )}
              {experience.description && (
                <p className="mt-2 text-sm text-slate-500">
                  {experience.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
