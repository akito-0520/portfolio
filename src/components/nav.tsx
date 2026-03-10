import Link from "next/link";

const links = [
  { href: "/articles", label: "Articles" },
  { href: "/products", label: "Products" },
  { href: "/experiences", label: "Experiences" },
];

export default function Nav() {
  return (
    <header className="border-b border-slate-200">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-slate-900"
        >
          Portfolio
        </Link>
        <ul className="flex gap-6">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm text-slate-500 transition-colors hover:text-blue-600"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
