"use client";

import { Sparkles, Users, Database } from "lucide-react";

export default function SocialProof() {
  return (
    <section className="w-full border-y border-zinc-100 bg-zinc-50/30 py-8 dark:border-zinc-900 dark:bg-zinc-900/10">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:divide-x sm:divide-zinc-100 dark:sm:divide-zinc-900">
          {/* Stat 1 */}
          <div className="flex flex-col items-center justify-center text-center sm:px-4">
            <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 mb-1">
              <Database className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Bookmarks Indexed</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              10,000+
            </span>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center justify-center text-center sm:px-4">
            <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 mb-1">
              <Users className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Active Workspace Users</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              2,000+
            </span>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center justify-center text-center sm:px-4">
            <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Search Accuracy</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              95%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
