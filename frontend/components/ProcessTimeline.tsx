"use client";

import { Link2, Search, Sparkles } from "lucide-react";

const steps = [
  {
    title: "Save a URL",
    desc: "Drop in an article, doc, paper, repository, or video link.",
    icon: Link2,
  },
  {
    title: "AI processes it",
    desc: "Bookmark Brain extracts the useful context, summary, and tags.",
    icon: Sparkles,
  },
  {
    title: "Search naturally",
    desc: "Ask for concepts, decisions, or examples without remembering filenames.",
    icon: Search,
  },
];

export default function ProcessTimeline() {
  return (
    <section id="process" className="w-full bg-white py-16 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-cyan-700 dark:text-cyan-400">
              How it works
            </p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-zinc-950 dark:text-zinc-50">
              Three steps from link to knowledge.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            The product does the heavy lifting after you save. No folder setup, tagging system, or manual cleanup required.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                  <step.icon className="h-4 w-4" />
                </div>
                <span className="font-mono text-xs text-zinc-400">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
