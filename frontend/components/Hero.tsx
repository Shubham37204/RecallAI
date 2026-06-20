"use client";

import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Folder, 
  Tag, 
  Sparkles, 
  Compass, 
  Bookmark, 
  ArrowUpRight, 
  Play, 
  Clock, 
  BookOpen, 
  Command 
} from "lucide-react";

export default function Hero() {
  const scrollToDemo = () => {
    const demoElement = document.getElementById("search-demo");
    if (demoElement) {
      demoElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full bg-white pt-20 pb-16 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        {/* Subtle Pill Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50/50 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
          <span>Next-generation knowledge graph</span>
        </div>

        {/* Headline */}
        <h1 className="mt-6 text-4xl font-medium tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
          Save links. <br />
          <span className="text-zinc-400 dark:text-zinc-500">
            Build a searchable knowledge system.
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
          Bookmark Brain reads, summarizes, tags, and indexes everything you save.
          Your second brain, actually searchable.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <SignUpButton mode="modal">
            <Button size="lg" className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
              Start Free
            </Button>
          </SignUpButton>
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-md border border-zinc-200 px-5 py-2 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            onClick={scrollToDemo}
          >
            <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
            View Demo
          </Button>
        </div>
      </div>

      {/* Large Product Workspace Preview (60-70% width) */}
      <div className="mx-auto mt-16 max-w-5xl px-6">
        <div className="group relative rounded-xl border border-zinc-200/80 bg-zinc-50 p-2 dark:border-zinc-800/80 dark:bg-zinc-900/50">
          {/* Mock Browser Header */}
          <div className="mb-2 flex items-center justify-between border-b border-zinc-200/60 pb-2 px-2 dark:border-zinc-800/60">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <span className="h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <span className="h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
            {/* Search Input Mock */}
            <div className="flex h-6 w-80 items-center justify-between rounded-md border border-zinc-200/80 bg-white px-2 text-[11px] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center gap-1.5">
                <Search className="h-3 w-3 text-zinc-400" />
                <span>Ask anything in plain English...</span>
              </div>
              <div className="flex items-center gap-0.5 font-mono text-[9px]">
                <kbd className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">⌘</kbd>
                <kbd className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">K</kbd>
              </div>
            </div>
            <div className="w-12" /> {/* spacer for visual symmetry */}
          </div>

          {/* Core Dashboard UI Container */}
          <div className="grid h-[420px] w-full grid-cols-12 overflow-hidden rounded-lg bg-white dark:bg-zinc-950">
            {/* 1. Sidebar */}
            <aside className="col-span-3 hidden flex-col border-r border-zinc-100 p-3 sm:flex dark:border-zinc-900">
              <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950">
                  <Command className="h-3 w-3" />
                </div>
                <span>Workspace</span>
              </div>

              {/* Sidebar Links */}
              <nav className="mt-4 flex flex-col gap-0.5">
                <span className="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">Library</span>
                {[
                  { icon: Bookmark, name: "All Bookmarks", count: 42 },
                  { icon: Clock, name: "Recently Saved", count: 8 },
                  { icon: Compass, name: "Discover", count: 0 },
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between rounded px-2 py-1.5 text-xs transition-colors cursor-pointer ${
                      idx === 0 
                        ? "bg-zinc-100/80 text-zinc-900 font-medium dark:bg-zinc-900 dark:text-zinc-100" 
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-3.5 w-3.5" />
                      <span>{item.name}</span>
                    </div>
                    {item.count > 0 && <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{item.count}</span>}
                  </div>
                ))}

                <span className="mt-4 px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">Collections</span>
                {[
                  { name: "Coding Resources", color: "text-blue-500" },
                  { name: "Research Papers", color: "text-purple-500" },
                  { name: "Product Design", color: "text-orange-500" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded px-2 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Folder className={`h-3.5 w-3.5 ${item.color}`} />
                      <span>{item.name}</span>
                    </div>
                  </div>
                ))}
              </nav>
            </aside>

            {/* 2. Main List view */}
            <main className="col-span-12 flex flex-col border-r border-zinc-100 sm:col-span-5 dark:border-zinc-900">
              <div className="flex h-10 items-center justify-between border-b border-zinc-100 px-3 dark:border-zinc-900">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">All Bookmarks</span>
                <Button variant="ghost" size="icon-xs" className="h-6 w-6">
                  <Plus className="h-3.5 w-3.5 text-zinc-500" />
                </Button>
              </div>

              {/* Mock items list */}
              <div className="flex-1 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-900">
                {[
                  {
                    title: "Zustand: Bearish state management library for React",
                    url: "github.com/pmndrs/zustand",
                    time: "10m ago",
                    tags: ["React", "State"],
                    active: true,
                  },
                  {
                    title: "An Interactive Guide to CSS Transitions & Animations",
                    url: "joshwcomeau.com",
                    time: "2h ago",
                    tags: ["CSS", "Frontend"],
                    active: false,
                  },
                  {
                    title: "Notion's API: Designing stable integrations",
                    url: "developers.notion.com",
                    time: "1d ago",
                    tags: ["API", "Backend"],
                    active: false,
                  },
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col gap-1.5 p-3 text-left transition-colors cursor-pointer ${
                      item.active 
                        ? "bg-zinc-50/80 dark:bg-zinc-900/40" 
                        : "hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
                      <span>{item.url}</span>
                      <span>{item.time}</span>
                    </div>
                    <h4 className="text-xs font-medium leading-snug text-zinc-900 dark:text-zinc-100 line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="rounded text-[9px] px-1 py-0 h-4 bg-zinc-100 text-zinc-600 border-none dark:bg-zinc-900 dark:text-zinc-400"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </main>

            {/* 3. Detail Pane */}
            <aside className="col-span-4 hidden flex-col p-4 sm:flex bg-zinc-50/30 dark:bg-zinc-900/10">
              <div className="flex items-center justify-between border-b border-zinc-100/80 pb-2 dark:border-zinc-900">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">AI Analysis</span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                  <Sparkles className="h-2.5 w-2.5" />
                  Synced
                </span>
              </div>

              {/* Summary detail */}
              <div className="mt-3 flex flex-col gap-3">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                    <span>Zustand State Library</span>
                    <ArrowUpRight className="h-3 w-3 text-zinc-400" />
                  </h3>
                  <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500 truncate">github.com/pmndrs/zustand</p>
                </div>

                <div className="rounded-lg border border-zinc-200/50 bg-white p-2.5 dark:border-zinc-800/50 dark:bg-zinc-950">
                  <div className="flex items-center gap-1 text-[10px] font-medium text-zinc-800 dark:text-zinc-300">
                    <BookOpen className="h-3 w-3 text-zinc-500" />
                    <span>Summary</span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                    A small, fast, and scalable bearbones state-management solution using simplified flux principles. Has a comfy API based on hooks, doesn't boilerplate or opinionate.
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Key Takeaways</h4>
                  <ul className="mt-1.5 space-y-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <li className="flex items-start gap-1.5">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-zinc-900 dark:bg-zinc-400" />
                      <span>Solves common React render-triggering issues without complex contexts.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-zinc-900 dark:bg-zinc-400" />
                      <span>Supports ephemeral state updates without triggering component refreshes.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
