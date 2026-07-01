"use client";

import { Archive, Search, Sparkles, Tags } from "lucide-react";

const capabilities = [
  {
    title: "Understand pages without rereading them.",
    desc: "Every saved source gets a clean summary and the important takeaways.",
    icon: Sparkles,
  },
  {
    title: "Remember ideas instead of filenames.",
    desc: "Search by concept, question, or half-remembered phrase.",
    icon: Search,
  },
  {
    title: "Stop maintaining folders manually.",
    desc: "Topics and tags are generated from the content itself.",
    icon: Tags,
  },
  {
    title: "Keep useful context accessible.",
    desc: "Saved sources become a durable, searchable archive.",
    icon: Archive,
  },
];

export default function FeatureShowcase() {
  return (
    <section id="features" className="w-full border-y border-zinc-200/70 bg-zinc-50 py-16 dark:border-zinc-900 dark:bg-zinc-900/20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-cyan-700 dark:text-cyan-400">
            Core capabilities
          </p>
          <h2 className="mt-3 text-2xl font-medium tracking-tight text-zinc-950 dark:text-zinc-50">
            The useful parts of a second brain, without the upkeep.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((item) => (
            <div key={item.title} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                <item.icon className="h-4 w-4" />
              </div>
              <h3 className="mt-5 text-sm font-semibold leading-5 text-zinc-950 dark:text-zinc-50">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
