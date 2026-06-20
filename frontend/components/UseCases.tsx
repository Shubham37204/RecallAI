"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  Search, 
  GraduationCap, 
  Briefcase, 
  Workflow, 
  ArrowRight 
} from "lucide-react";

export default function UseCases() {
  const cases = [
    {
      title: "Developers",
      stat: "1,200+ coding resources indexed",
      desc: "Save stack overflow posts, API docs, GitHub issues, and guides. Instantly surface code snippets when you are stuck.",
      workflow: "Save a complex Rust lifetimes guide → Ask: 'How to return a ref inside async rust?' → Get code block instantly.",
      icon: Code,
      accent: "border-blue-200 dark:border-blue-900 bg-blue-50/10",
      iconColor: "text-blue-500",
    },
    {
      title: "Researchers",
      stat: "8,000+ articles searchable",
      desc: "Compile research papers, essays, and news stories. Read summaries and query relationships across different sources.",
      workflow: "Index 15 PDFs on LLM fine-tuning → Ask: 'What is the consensus on LoRA ranks?' → Get cross-referenced summary.",
      icon: Search,
      accent: "border-purple-200 dark:border-purple-900 bg-purple-50/10",
      iconColor: "text-purple-500",
    },
    {
      title: "Students",
      stat: "3,500+ lecture notes organized",
      desc: "Store lecture notes, tutorials, study materials, and Wikipedia logs. Generate review questions from your saved resources.",
      workflow: "Save chemistry slide deck → Ask: 'Summarize transition metals properties' → Review bulleted facts.",
      icon: GraduationCap,
      accent: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/10",
      iconColor: "text-emerald-500",
    },
    {
      title: "Founders",
      stat: "2,500+ research papers stored",
      desc: "Organize market reports, competitor product pages, pricing grids, and VC feedback. Track intelligence seamlessly.",
      workflow: "Save 5 competitor updates → Ask: 'What pricing model changes did they make?' → Compare specific tiers.",
      icon: Briefcase,
      accent: "border-orange-200 dark:border-orange-900 bg-orange-50/10",
      iconColor: "text-orange-500",
    },
  ];

  return (
    <section id="use-cases" className="w-full bg-white py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-6">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Target Workflows
          </span>
          <h3 className="mt-2 text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
            Designed for heavy information gatherers
          </h3>
        </div>

        {/* Use Case Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {cases.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card 
                key={idx} 
                className={`flex flex-col justify-between p-6 border rounded-xl transition-all hover:border-zinc-300 dark:hover:border-zinc-700 ${item.accent}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 shadow-sm">
                      <Icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    {/* Integrated Stat badge */}
                    <Badge variant="outline" className="rounded-md border-zinc-200/80 px-2 py-0.5 text-[10px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 bg-white dark:bg-zinc-950 font-mono">
                      {item.stat}
                    </Badge>
                  </div>

                  <h4 className="mt-5 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {item.desc}
                  </p>
                </div>

                {/* Workflow segment */}
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex flex-col gap-1.5">
                  <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Workflow className="h-3 w-3" />
                    Example Workflow
                  </span>
                  <div className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <span>{item.workflow}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
