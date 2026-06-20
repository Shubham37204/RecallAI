"use client";

import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="w-full bg-white py-24 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
      <div className="mx-auto max-w-3xl px-6 text-center">
        {/* Subtle icon */}
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 mb-6">
          <Sparkles className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </div>

        {/* Headline */}
        <h2 className="text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50 leading-tight">
          Your knowledge should work for you.
        </h2>

        {/* Subhead */}
        <p className="mt-4 text-sm text-zinc-505 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
          Create your private workspace in seconds. Automatically index pages, extract takeaways, and build a second brain.
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3">
          <SignUpButton mode="modal">
            <Button size="lg" className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer">
              Create Workspace
            </Button>
          </SignUpButton>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
            Free forever tier. Upgrade anytime for higher indexing quotas.
          </span>
        </div>
      </div>
    </section>
  );
}
