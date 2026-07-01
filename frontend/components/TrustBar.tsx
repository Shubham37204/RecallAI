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
    { name: "Articles", icon: FileText, color: "text-blue-500" },
    { name: "Documentation", icon: BookOpen, color: "text-emerald-500" },
    { name: "Videos", icon: Video, color: "text-rose-500" },
    { name: "Threads", icon: Hash, color: "text-amber-550 dark:text-amber-450" },
    { name: "Research Papers", icon: GraduationCap, color: "text-purple-500" },
    { name: "Bookmarks", icon: Link2, color: "text-indigo-500" },
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
                className="flex items-center gap-2 rounded-md border border-zinc-200/80 bg-zinc-50/50 px-3 py-1.5 text-xs text-zinc-650 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:text-zinc-400 hover:border-violet-300 dark:hover:border-violet-850 hover:bg-violet-50/10 dark:hover:bg-violet-950/10 transition-all duration-300"
              >
                <Icon className={`h-3.5 w-3.5 ${source.color}`} />
                <span className="font-medium">{source.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
