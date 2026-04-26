type ContactLink = {
  label: string;
  href: string;
  value: string;
};

const links: ContactLink[] = [
  {
    label: "Email",
    href: "mailto:n.akito.h17@icloud.com",
    value: "n.akito.h17@icloud.com",
  },
  {
    label: "GitHub",
    href: "https://github.com/akito-0520",
    value: "@akito-0520",
  },
  {
    label: "X(Twitter)",
    href: "https://twitter.com/murabito_0520",
    value: "@murabito_0520",
  },
];

export default function ContactSection() {
  return (
    <section>
      <h2 className="mb-8 text-xl font-bold tracking-tight text-slate-900">
        Contact
      </h2>
      <p className="mb-6 text-sm text-slate-600">
        その他内容などのお問い合わせはお気軽にご連絡ください．
      </p>
      <ul className="space-y-3">
        {links.map(({ label, href, value }) => (
          <li
            key={label}
            className="flex items-baseline gap-4 border-b border-slate-100 pb-3"
          >
            <span className="w-20 text-xs font-semibold tracking-widest text-slate-400 uppercase">
              {label}
            </span>
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-sm text-slate-700 transition-colors hover:text-blue-600"
            >
              {value}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
