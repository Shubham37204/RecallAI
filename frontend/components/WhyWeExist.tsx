"use client";

import { AlertCircle, Search, HelpCircle } from "lucide-react";

export default function WhyWeExist() {
  return (
    <section className="w-full bg-zinc-50/50 py-16 dark:bg-zinc-900/20 border-y border-zinc-100 dark:border-zinc-900">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 items-start">
          {/* Headline block */}
          <div className="md:col-span-5 flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3 text-zinc-400" />
              The Bookmark Trap
            </span>
            <h2 className="text-3xl font-medium tracking-tight text-zinc-905 dark:text-zinc-50 leading-tight">
              Most bookmarks are never opened again.
            </h2>
          </div>

          {/* Narrative detail */}
          <div className="md:col-span-7 flex flex-col gap-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed md:pl-8 md:border-l md:border-zinc-200/60 dark:md:border-zinc-800/60">
            <p>
              People save hundreds of articles, videos, and docs, expecting to return to them later. Instead, links pile up in browser folders, chat apps, and digital drawers, completely forgotten.
            </p>
            <p className="font-medium text-zinc-905 dark:text-zinc-200">
              Bookmark Brain breaks this loop. It reads, tags, and extracts semantic meaning from everything you save, turning stale URLs into an active, searchable second brain.
            </p>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-2 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex gap-2">
                <HelpCircle className="h-4 w-4 shrink-0 text-zinc-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">The Problem</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Searching by title/URL fails when you can only remember the core concept.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Search className="h-4 w-4 shrink-0 text-zinc-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">The Solution</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Search inside the actual page text using simple, conversational English.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
