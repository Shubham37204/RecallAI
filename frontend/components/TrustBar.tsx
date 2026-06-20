"use client";

import { 
  FileText, 
  BookOpen, 
  Video, 
  Hash, 
  GraduationCap, 
  Link2 
} from "lucide-react";

export default function TrustBar() {
  const sources = [
    { name: "Articles", icon: FileText },
    { name: "Documentation", icon: BookOpen },
    { name: "Videos", icon: Video },
    { name: "Threads", icon: Hash },
    { name: "Research Papers", icon: GraduationCap },
    { name: "Bookmarks", icon: Link2 },
  ];

  return (
    <section className="w-full bg-white py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Save content from everywhere
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {sources.map((source, index) => {
            const Icon = source.icon;
            return (
              <div 
                key={index} 
                className="flex items-center gap-2 rounded-md border border-zinc-200/80 bg-zinc-50/50 px-3 py-1.5 text-xs text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:text-zinc-400"
              >
                <Icon className="h-3.5 w-3.5 text-zinc-400" />
                <span className="font-medium">{source.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
