"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Folder, 
  Tag, 
  Search, 
  Sparkles, 
  FileText, 
  Layers, 
  ExternalLink,
  BookOpen, 
  HelpCircle,
  Library,
  Settings,
  Activity,
  Globe
} from "lucide-react";

export default function WorkspacePreview() {
  const [activeTab, setActiveTab] = useState("all");

  const bookmarks = {
    all: [
      {
        id: 1,
        title: "React 19 Server Actions & Form States Guide",
        domain: "react.dev",
        tags: ["React 19", "Frontend", "Actions"],
        readTime: "8 min read",
        summary: "A detailed breakdown of how to use Server Actions in React 19, including handling transitions using useTransition and form states using useActionState.",
        takeaways: ["Server Actions run securely on the server.", "No need to write explicit fetch endpoints for standard state mutations."]
      },
      {
        id: 2,
        title: "Designing for AI: Patterns, guidelines and heuristics",
        domain: "uxdesign.cc",
        tags: ["Design System", "AI UX", "Heuristics"],
        readTime: "14 min read",
        summary: "Heuristics for structuring user interfaces for LLMs, including feedback loops, explaining confidence levels, and offering instant undo options.",
        takeaways: ["UX should emphasize co-creation instead of passive chat feeds.", "Progressive disclosure reduces user cognitive overload."]
      },
      {
        id: 3,
        title: "How database engines perform atomic commits",
        domain: "vldb.org",
        tags: ["Databases", "Distributed System"],
        readTime: "22 min read",
        summary: "Deep-dive into 2-phase commit (2PC) and Paxos algorithms, exploring consensus mechanisms, transaction journals, and error recovery.",
        takeaways: ["2PC acts as a blocker under coordinator failures.", "3PC solves blocking issues but introduces higher network overhead."]
      }
    ],
    coding: [
      {
        id: 1,
        title: "React 19 Server Actions & Form States Guide",
        domain: "react.dev",
        tags: ["React 19", "Frontend", "Actions"],
        readTime: "8 min read",
        summary: "A detailed breakdown of how to use Server Actions in React 19, including handling transitions using useTransition and form states using useActionState.",
        takeaways: ["Server Actions run securely on the server.", "No need to write explicit fetch endpoints for standard state mutations."]
      }
    ],
    design: [
      {
        id: 2,
        title: "Designing for AI: Patterns, guidelines and heuristics",
        domain: "uxdesign.cc",
        tags: ["Design System", "AI UX", "Heuristics"],
        readTime: "14 min read",
        summary: "Heuristics for structuring user interfaces for LLMs, including feedback loops, explaining confidence levels, and offering instant undo options.",
        takeaways: ["UX should emphasize co-creation instead of passive chat feeds.", "Progressive disclosure reduces user cognitive overload."]
      }
    ]
  };

  const getFilteredBookmarks = () => {
    if (activeTab === "all") return bookmarks.all;
    if (activeTab === "coding") return bookmarks.coding;
    if (activeTab === "design") return bookmarks.design;
    return bookmarks.all;
  };

  const [selectedItem, setSelectedItem] = useState(bookmarks.all[0]);

  return (
    <section id="workspace-preview" className="w-full bg-zinc-50/50 py-20 dark:bg-zinc-900/10 border-y border-zinc-100 dark:border-zinc-900">
      <div className="mx-auto max-w-5xl px-6">
        
        {/* Title Block */}
        <div className="text-center mb-12">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Interface walkthrough
          </span>
          <h3 className="mt-2 text-2xl font-medium tracking-tight text-zinc-905 dark:text-zinc-50">
            Inside the Workspace
          </h3>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
            Experience the design of your personal workspace. Highly optimized for reading, searching, and quick referencing.
          </p>
        </div>

        {/* Dashboard Shell */}
        <div className="rounded-xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden dark:border-zinc-800/80 dark:bg-zinc-950">
          
          {/* Top Panel Controls */}
          <div className="flex h-12 items-center justify-between border-b border-zinc-100 px-4 dark:border-zinc-900">
            <div className="flex items-center gap-2">
              <Library className="h-4 w-4 text-zinc-500" />
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Main Library</span>
            </div>
            
            {/* Nav tabs for workspaces */}
            <div className="flex items-center gap-1.5">
              <Tabs defaultValue="all" onValueChange={(val) => {
                setActiveTab(val);
                const items = bookmarks[val as keyof typeof bookmarks] || bookmarks.all;
                if (items.length > 0) setSelectedItem(items[0]);
              }}>
                <TabsList className="bg-zinc-100/80 dark:bg-zinc-900/60 p-0.5 rounded-md h-7">
                  <TabsTrigger value="all" className="text-[10px] h-6 px-2.5 rounded">All</TabsTrigger>
                  <TabsTrigger value="coding" className="text-[10px] h-6 px-2.5 rounded">Coding</TabsTrigger>
                  <TabsTrigger value="design" className="text-[10px] h-6 px-2.5 rounded">Design</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <Globe className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Production Vault</span>
              </div>
              <Settings className="h-4 w-4 text-zinc-400 cursor-pointer hover:text-zinc-600" />
            </div>
          </div>

          {/* Three Column Layout */}
          <div className="grid h-[500px] grid-cols-12">
            
            {/* Col 1: Sidebar Directory */}
            <div className="col-span-3 hidden sm:flex flex-col border-r border-zinc-100 p-3 dark:border-zinc-900 bg-zinc-50/20 dark:bg-zinc-950/20">
              <div className="space-y-4">
                {/* Section 1 */}
                <div className="flex flex-col gap-1">
                  <span className="px-2 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Library</span>
                  <div className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-zinc-900 bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 font-medium cursor-pointer">
                    <Library className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Bookmarks</span>
                  </div>
                  <div className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900/50 cursor-pointer">
                    <Activity className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Recent Activity</span>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Folders</span>
                  </div>
                  {[
                    { name: "Development", count: 12 },
                    { name: "UX Design", count: 8 },
                    { name: "Databases", count: 4 },
                  ].map((folder, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded px-2 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900/50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Folder className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{folder.name}</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono">{folder.count}</span>
                    </div>
                  ))}
                </div>

                {/* Section 3 */}
                <div className="flex flex-col gap-1">
                  <span className="px-2 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Global Tags</span>
                  <div className="flex flex-wrap gap-1 p-1">
                    {["React 19", "Frontend", "Actions", "UX Design", "Consensus"].map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded text-[9px] px-1.5 py-0.5 bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border-none">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Col 2: Middle Items List (Scrollable) */}
            <div className="col-span-12 sm:col-span-5 flex flex-col border-r border-zinc-100 dark:border-zinc-900">
              <ScrollArea className="flex-1">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {getFilteredBookmarks().map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`flex flex-col gap-2 p-4 text-left transition-colors cursor-pointer ${
                        selectedItem.id === item.id 
                          ? "bg-zinc-50 dark:bg-zinc-900/50" 
                          : "hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="font-semibold text-zinc-500">{item.domain}</span>
                        <span>{item.readTime}</span>
                      </div>
                      
                      <h4 className="text-xs font-semibold leading-snug text-zinc-800 dark:text-zinc-200">
                        {item.title}
                      </h4>

                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="rounded text-[9px] px-1 h-4 bg-zinc-100 text-zinc-500 border-none dark:bg-zinc-900/80 dark:text-zinc-400"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Col 3: Reading Drawer Detail view */}
            <div className="col-span-12 sm:col-span-4 flex flex-col p-5 bg-zinc-50/20 dark:bg-zinc-900/5 overflow-y-auto">
              {/* Header metadata */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-900">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">AI Reading Desk</span>
                <a 
                  href={`https://${selectedItem.domain}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 hover:text-zinc-600"
                >
                  Visit Link
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              {/* Body */}
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {selectedItem.title}
                  </h3>
                  <span className="text-[10px] text-zinc-400 block mt-1">{selectedItem.domain}</span>
                </div>

                <Separator />

                {/* AI Summary Block */}
                <div className="rounded-lg border border-zinc-200/50 bg-white p-3 dark:border-zinc-800/60 dark:bg-zinc-950 shadow-sm">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
                    <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Abstract Summary</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {selectedItem.summary}
                  </p>
                </div>

                {/* Bullets Key Takeaways */}
                <div>
                  <h4 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Indexed Takeaways</h4>
                  <ul className="mt-2 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {selectedItem.takeaways.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-900 dark:bg-zinc-400" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
