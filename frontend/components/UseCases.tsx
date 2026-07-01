"use client";

import { BookOpen, Briefcase, Code2, FileText, GraduationCap, Newspaper, PlaySquare, ScrollText } from "lucide-react";

const audiences = [
  {
    title: "Developer",
    desc: "Save docs, GitHub issues, API references, and debugging guides.",
    icon: Code2,
  },
  {
    title: "Researcher",
    desc: "Collect papers, essays, and long-form sources into one searchable base.",
    icon: BookOpen,
  },
  {
    title: "Student",
    desc: "Turn tutorials, lecture material, and study links into reviewable notes.",
    icon: GraduationCap,
  },
  {
    title: "Founder",
    desc: "Track competitors, market research, pricing pages, and product ideas.",
    icon: Briefcase,
  },
];

const sources = [
  { label: "GitHub", icon: Code2 },
  { label: "Documentation", icon: FileText },
  { label: "Blogs", icon: Newspaper },
  { label: "Research Papers", icon: ScrollText },
  { label: "PDFs", icon: FileText },
  { label: "YouTube", icon: PlaySquare },
  { label: "Articles", icon: BookOpen },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="w-full bg-white py-16 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-cyan-700 dark:text-cyan-400">
              Who it is for
            </p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-zinc-950 dark:text-zinc-50">
              Built for people who collect useful information all day.
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {audiences.map((item) => (
                <div key={item.title} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-cyan-700 dark:text-cyan-400" />
                    <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{item.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/30">
            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Supported content</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Save the sources you already use. Bookmark Brain turns them into one searchable workspace.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {sources.map((source) => (
                <div key={source.label} className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  <source.icon className="h-3.5 w-3.5 text-cyan-700 dark:text-cyan-400" />
                  {source.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
