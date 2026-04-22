type SkillCategory = {
  name: string;
  items: string[];
};

type Props = {
  title?: string;
  categories?: SkillCategory[];
};

export default function SkillsSection({
  title = "Skills",
  categories = [],
}: Props) {
  return (
    <section>
      <h2 className="mb-8 text-xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {categories.map((category) => (
          <div key={category.name}>
            <h3 className="mb-3 text-xs font-semibold tracking-widest text-slate-400 uppercase">
              {category.name}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {category.items.map((skill) => (
                <li
                  key={skill}
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
