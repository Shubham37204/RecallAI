"use client";

import Link from "next/link";
import { Command } from "lucide-react";

export default function Footer() {
  const links = [
    { label: "GitHub", href: "https://github.com" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Contact", href: "#" },
  ];

  return (
    <footer className="w-full border-t border-zinc-200 bg-white py-8 dark:border-zinc-900 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-cyan-600 text-white">
            <Command className="h-3 w-3" />
          </div>
          <span>Bookmark Brain</span>
        </Link>

        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition hover:text-zinc-950 dark:hover:text-zinc-100"
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <span className="text-zinc-400">
            &copy; {new Date().getFullYear()} Bookmark Brain
          </span>
        </div>
      </div>
    </footer>
  );
}
