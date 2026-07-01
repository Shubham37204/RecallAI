"use client";

import { SignUpButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTA() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <section className="w-full border-t border-zinc-200 bg-white py-20 dark:border-zinc-900 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-medium tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
          Start building your searchable second brain.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Save one useful link today. Let Bookmark Brain handle the reading, tagging, and recall.
        </p>
        <div className="mt-8">
          {isLoaded && isSignedIn ? (
            <Button asChild size="lg" className="rounded-md bg-cyan-600 px-6 text-white hover:bg-cyan-700">
              <Link href="/dashboard">Open Workspace</Link>
            </Button>
          ) : isLoaded ? (
            <SignUpButton mode="modal">
              <Button size="lg" className="rounded-md bg-cyan-600 px-6 text-white hover:bg-cyan-700">
                Get Started
              </Button>
            </SignUpButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}
