"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/articles", label: "Articles" },
  { href: "/products", label: "Products" },
  { href: "/experiences", label: "Experiences" },
  { href: "/slides", label: "Slides" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="bg-background/90 sticky top-0 z-40 border-b border-slate-200/60 backdrop-blur-md">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-sm font-bold tracking-tight text-slate-900"
        >
          Portfolio
        </Link>
        <ul className="flex gap-6">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm font-medium transition-colors duration-150 ${
                  pathname.startsWith(href)
                    ? "text-blue-600 underline decoration-blue-600 underline-offset-4"
                    : "text-slate-600 hover:text-blue-600"
                }`}
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
