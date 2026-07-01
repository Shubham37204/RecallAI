"use client";

import type { ReactNode } from "react";
import { ArrowDown, CheckCircle2, Search, XCircle } from "lucide-react";

const oldWay = ["Saved forever", "Forgotten in folders", "Search by title"];
const newWay = ["AI reads pages", "Summaries and tags", "Search by meaning"];

export default function WhyWeExist() {
  return (
    <section className="w-full border-y border-zinc-200/70 bg-zinc-50 py-16 dark:border-zinc-900 dark:bg-zinc-900/20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-cyan-700 dark:text-cyan-400">
              Problem to solution
            </p>
            <h2 className="mt-3 max-w-md text-3xl font-medium tracking-tight text-zinc-950 dark:text-zinc-50">
              Bookmarks remember links. You need to remember ideas.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Browser folders store URLs, not context. Bookmark Brain reads the source and makes the knowledge searchable.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <ComparisonCard
              title="Traditional bookmarks"
              icon={<XCircle className="h-4 w-4 text-zinc-400" />}
              items={oldWay}
              muted
            />
            <div className="flex justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-cyan-700 shadow-sm sm:rotate-[-90deg]">
                <ArrowDown className="h-4 w-4" />
              </div>
            </div>
            <ComparisonCard
              title="Bookmark Brain"
              icon={<Search className="h-4 w-4 text-cyan-700" />}
              items={newWay}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonCard({
  title,
  icon,
  items,
  muted = false,
}: {
  title: string;
  icon: ReactNode;
  items: string[];
  muted?: boolean;
}) {
  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm dark:bg-zinc-950 ${muted ? "border-zinc-200 dark:border-zinc-800" : "border-cyan-200 dark:border-cyan-900"}`}>
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{title}</h3>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <CheckCircle2 className={`h-3.5 w-3.5 ${muted ? "text-zinc-300" : "text-cyan-600"}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
