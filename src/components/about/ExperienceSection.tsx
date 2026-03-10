type Experience = {
  title: string;
  date: string;
  organization?: string;
  description?: string;
};

type Props = {
  title?: string;
  experiences?: Experience[];
};

export default function ExperienceSection({
  title = "Experiences",
  experiences = [],
}: Props) {
  return (
    <section>
      <h2 className="mb-8 text-xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <ol className="relative border-l border-slate-200">
        {experiences.map((item, i) => (
          <li key={i} className="mb-8 ml-6 last:mb-0">
            <span className="absolute -left-[7px] flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-blue-600 bg-white" />
            <p className="text-xs font-medium text-blue-600">{item.date}</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">
              {item.title}
            </h3>
            {item.organization && (
              <p className="text-sm font-medium text-slate-500">
                {item.organization}
              </p>
            )}
            {item.description && (
              <p className="mt-2 text-sm text-slate-500">{item.description}</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
