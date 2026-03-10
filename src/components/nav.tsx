import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/products", label: "Products" },
  { href: "/awards", label: "Awards" },
];

export default function Nav() {
  return (
    <header className="border-b border-zinc-100">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-sm font-medium tracking-wide text-zinc-900"
        >
          Portfolio
        </Link>
        <ul className="flex gap-6">
          {links.slice(1).map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
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
