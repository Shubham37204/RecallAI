"use client";

import { Link2, Cpu, Database, Search } from "lucide-react";

export default function ProcessTimeline() {
  const steps = [
    {
      num: "01",
      title: "Save a URL",
      desc: "Paste any link into your workspace. We support articles, videos, and PDFs.",
      icon: Link2,
    },
    {
      num: "02",
      title: "AI extracts content",
      desc: "Our engine scrapes the page, bypassing ads and paywalls, to extract clean text.",
      icon: Cpu,
    },
    {
      num: "03",
      title: "Generate embeddings",
      desc: "The entire document is vectorized and mapped into your personal knowledge base.",
      icon: Database,
    },
    {
      num: "04",
      title: "Search in natural language",
      desc: "Ask conversational questions like 'What was Josh's advice on React renders?'",
      icon: Search,
    },
  ];

  return (
    <section id="process" className="w-full bg-white py-16 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-6">
        {/* Title */}
        <div className="text-center mb-12">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Process Flow
          </span>
          <h3 className="mt-2 text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
            How Bookmark Brain Works
          </h3>
        </div>

        {/* Timeline Items */}
        <div className="relative mt-8">
          {/* Connecting line for larger screens */}
          <div className="absolute top-1/2 left-0 right-0 hidden h-px -translate-y-1/2 border-t border-dashed border-zinc-200 md:block dark:border-zinc-800" />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div 
                  key={idx} 
                  className="relative flex flex-col items-center text-center bg-white p-4 dark:bg-zinc-950 z-10"
                >
                  {/* Step bubble */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                    <Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  </div>

                  <span className="mt-4 font-mono text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                    Step {step.num}
                  </span>

                  <h4 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {step.title}
                  </h4>

                  <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
