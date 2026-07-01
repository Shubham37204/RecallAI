"use client";

import Link from "next/link";
import { Command, Github } from "lucide-react";

export function DashboardFooter() {
  return (
    <footer className="border-t border-zinc-200/70 bg-white/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-cyan-600 text-white">
            <Command className="h-3 w-3" />
          </div>
          <span className="font-medium text-zinc-700">Bookmark Brain</span>
          <span className="text-zinc-300">/</span>
          <span>AI knowledge workspace</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="transition hover:text-zinc-950">
            Landing
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition hover:text-zinc-950"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
          <Link href="#" className="transition hover:text-zinc-950">
            Privacy
          </Link>
          <Link href="#" className="transition hover:text-zinc-950">
            Terms
          </Link>
          <span className="text-zinc-400">
            &copy; {new Date().getFullYear()} Bookmark Brain
          </span>
        </div>
      </div>
    </footer>
  );
}
