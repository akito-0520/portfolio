type ExperienceItem = {
  period: string;
  role: string;
  company: string;
  description?: string;
};

type Props = {
  title?: string;
  items?: ExperienceItem[];
};

export default function ExperienceSection({
  title = "Experience",
  items = [],
}: Props) {
  return (
    <section>
      <h2 className="mb-8 text-xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <ol className="relative border-l border-slate-200">
        {items.map((item, i) => (
          <li key={i} className="mb-8 ml-6 last:mb-0">
            <span className="absolute -left-[7px] flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-blue-600 bg-white" />
            <p className="text-xs font-medium text-blue-600">{item.period}</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">
              {item.role}
            </h3>
            <p className="text-sm font-medium text-slate-500">{item.company}</p>
            {item.description && (
              <p className="mt-2 text-sm text-slate-500">{item.description}</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
