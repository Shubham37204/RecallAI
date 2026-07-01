"use client";

import { SignUpButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Link2,
  MoreHorizontal,
  Play,
  Plus,
  Search,
} from "lucide-react";

export default function Hero() {
  const { isLoaded, isSignedIn } = useUser();

  const scrollToProcess = () => {
    const processElement = document.getElementById("process");
    if (processElement) {
      processElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-white pt-20 pb-16 dark:bg-zinc-950">
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-cyan-100/20 blur-[128px] dark:bg-cyan-950/15" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        <h1 className="mt-6 text-4xl font-medium tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
          Save links. <br />
          <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text font-semibold text-transparent">
            Build a searchable knowledge system.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          Paste any article, documentation, paper, or repository. Bookmark Brain turns it into summaries, tags, and semantic search.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          {isLoaded && isSignedIn ? (
            <Button asChild size="lg" className="rounded-md bg-cyan-600 px-5 py-2 text-white hover:bg-cyan-700">
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
          ) : isLoaded ? (
            <SignUpButton mode="modal">
              <Button size="lg" className="rounded-md bg-cyan-600 px-5 py-2 text-white hover:bg-cyan-700">
                Start Free
              </Button>
            </SignUpButton>
          ) : null}
          <Button
            variant="outline"
            size="lg"
            className="rounded-md border border-cyan-200 px-5 py-2 text-cyan-700 hover:bg-cyan-50/70 dark:border-cyan-900/60 dark:text-cyan-400 dark:hover:bg-cyan-950/20"
            onClick={scrollToProcess}
          >
            <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
            See how it works
          </Button>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-16 max-w-5xl px-6">
        <div className="group relative rounded-xl border border-cyan-100/80 bg-zinc-50/70 p-2 transition-all duration-500 hover:border-cyan-300 hover:shadow-[0_0_40px_-15px_rgba(8,145,178,0.2)] dark:border-cyan-950/80 dark:bg-zinc-900/30">
          <div className="mb-2 flex items-center justify-between border-b border-zinc-200/60 px-2 pb-2 dark:border-zinc-800/60">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex h-6 w-80 items-center gap-1.5 rounded-md border border-cyan-100 bg-white px-2 text-[11px] text-zinc-400 dark:border-cyan-900/50 dark:bg-zinc-950">
              <Search className="h-3 w-3 text-cyan-600" />
              <span>Ask your bookmarks...</span>
            </div>
            <div className="w-12" />
          </div>

          <div className="h-[460px] overflow-hidden rounded-lg border border-cyan-50/70 bg-zinc-50 p-4 dark:border-cyan-950/50 dark:bg-zinc-950">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                  <Link2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">Save a URL</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Build your AI knowledge base</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1.5 dark:border-zinc-800 dark:bg-zinc-950">
                <span className="min-w-0 flex-1 truncate px-2 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                  https://www.pinecone.io/learn/retrieval-augmented-generation/
                </span>
                <Button size="xs" className="rounded-md bg-cyan-600 text-white hover:bg-cyan-700">
                  <Plus className="h-3 w-3" />
                  Save
                </Button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                ["Total", "42"],
                ["Processed", "38"],
                ["Processing", "3"],
                ["Failed", "1"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-zinc-200 bg-white p-2 text-left dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-[9px] text-zinc-500 dark:text-zinc-400">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex h-8 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2 dark:border-zinc-800 dark:bg-zinc-950">
                <Search className="h-3.5 w-3.5 text-cyan-700 dark:text-cyan-300" />
                <span className="text-[11px] text-zinc-400">Ask your bookmarks...</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {["docker compose", "agent memory", "vector databases"].map((item) => (
                  <span key={item} className="rounded-full border border-zinc-200 px-2 py-0.5 text-[9px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-zinc-200 bg-white text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">Bookmark Library</p>
                <span className="text-[10px] text-zinc-400">Newest first</span>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {[
                  {
                    title: "Retrieval Augmented Generation: What it is and how it works",
                    domain: "pinecone.io",
                    status: "Processing",
                    tags: ["RAG", "Vector DB"],
                  },
                  {
                    title: "Docker Compose documentation for local services",
                    domain: "docs.docker.com",
                    status: "Processed",
                    tags: ["Docker", "DevOps"],
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-[10px] font-semibold text-cyan-700 dark:border-zinc-800 dark:bg-zinc-950">
                      {item.domain[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[10px] text-zinc-500 dark:text-zinc-400">{item.domain}</span>
                        <Badge className="h-4 rounded-full border border-cyan-200 bg-cyan-50 px-1.5 py-0 text-[9px] text-cyan-700">
                          {item.status}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</p>
                      <div className="mt-1 flex gap-1">
                        {item.tags.map((tag) => (
                          <span key={tag} className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 text-zinc-400">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
