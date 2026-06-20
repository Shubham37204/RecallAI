"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Search, 
  Sparkles, 
  FileText, 
  Folder, 
  Tag, 
  BookOpen, 
  ArrowUpRight 
} from "lucide-react";

export default function SearchDemo() {
  const [searchQuery, setSearchQuery] = useState("React state management");

  return (
    <section id="search-demo" className="w-full bg-zinc-900 py-20 dark:bg-zinc-950 border-t border-zinc-800">
      <div className="mx-auto max-w-5xl px-6">
        
        {/* Title */}
        <div className="text-center mb-12">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
            Interactive Playground
          </span>
          <h3 className="mt-2 text-2xl font-medium tracking-tight text-white">
            Test the AI retrieval engine
          </h3>
          <p className="mt-3 text-sm text-zinc-400 max-w-md mx-auto">
            Switch tabs below to see how Bookmark Brain indexes, groups, and summarizes your saves.
          </p>
        </div>

        {/* Tab System Wrapper */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-1">
          <Tabs defaultValue="search" className="w-full">
            
            {/* Nav Tabs List */}
            <div className="border-b border-zinc-900 px-4 py-2 flex items-center justify-between">
              <TabsList className="bg-zinc-900 border-none p-0.5 rounded-md h-8">
                <TabsTrigger value="search" className="text-[11px] h-7 px-3 rounded text-zinc-400 data-active:text-white">
                  <Search className="h-3 w-3 mr-1" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="summaries" className="text-[11px] h-7 px-3 rounded text-zinc-400 data-active:text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Summaries
                </TabsTrigger>
                <TabsTrigger value="tags" className="text-[11px] h-7 px-3 rounded text-zinc-400 data-active:text-white">
                  <Tag className="h-3 w-3 mr-1" />
                  Tags
                </TabsTrigger>
                <TabsTrigger value="collections" className="text-[11px] h-7 px-3 rounded text-zinc-400 data-active:text-white">
                  <Folder className="h-3 w-3 mr-1" />
                  Collections
                </TabsTrigger>
              </TabsList>
              
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-zinc-800" />
                <span className="h-2 w-2 rounded-full bg-zinc-800" />
                <span className="h-2 w-2 rounded-full bg-zinc-800" />
              </div>
            </div>

            {/* Tab 1: Search */}
            <TabsContent value="search" className="p-6">
              <div className="max-w-2xl mx-auto flex flex-col gap-4">
                {/* Simulated search input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Results for "{searchQuery}"</span>

                {/* List of articles */}
                <div className="flex flex-col gap-2.5">
                  {[
                    {
                      title: "Zustand: Bearish state management library for React",
                      url: "github.com/pmndrs/zustand",
                      match: "98% Match",
                      desc: "A small, fast state-management tool designed on flux principles. Integrates directly into React component renders using hooks.",
                    },
                    {
                      title: "Redux Toolkit: Modern, standardized Redux configs",
                      url: "redux-toolkit.js.org",
                      match: "85% Match",
                      desc: "The official, opinionated toolset for efficient Redux development. Simplifies store creation and reducer logic using Immer.",
                    },
                    {
                      title: "React Context API documentation",
                      url: "react.dev/reference/context",
                      match: "74% Match",
                      desc: "Built-in React prop-drilling solution. Passes data deep into the component tree without manually mapping props.",
                    },
                  ].map((res, index) => (
                    <div 
                      key={index} 
                      className="border border-zinc-900 rounded-lg p-3.5 bg-zinc-900/20 hover:border-zinc-800/80 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500">{res.url}</span>
                        <span className="text-[10px] text-emerald-500 bg-emerald-950/40 border border-emerald-900 px-1.5 py-0.5 rounded font-mono">{res.match}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-zinc-200 mt-1 flex items-center justify-between">
                        <span>{res.title}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600" />
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">{res.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Summaries */}
            <TabsContent value="summaries" className="p-6">
              <div className="max-w-xl mx-auto border border-zinc-900 rounded-lg bg-zinc-900/20 p-4">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5">
                  <Sparkles className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs font-semibold text-zinc-300">Zustand Summary Sheet</span>
                </div>
                <div className="mt-3 space-y-3">
                  <div>
                    <h5 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Abstract</h5>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Zustand provides a simplified hook-based state management store. It focuses on solving state management overheads without wrapping the DOM tree inside Context Providers.
                    </p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Key Features</h5>
                    <ul className="list-disc list-inside text-xs text-zinc-400 mt-1 space-y-1">
                      <li>Simple API syntax based on hooks</li>
                      <li>Doesn't trigger component refresh on non-selected states</li>
                      <li>Transient updates support (state changes without render cycles)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Tags */}
            <TabsContent value="tags" className="p-6">
              <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
                {[
                  { tag: "React 19", count: 18, desc: "Framework docs, hooks & guides" },
                  { tag: "State Management", count: 12, desc: "Zustand, Redux, Context guides" },
                  { tag: "CSS Grid", count: 6, desc: "Flexbox, CSS rules, layout tips" },
                  { tag: "Database Indexing", count: 8, desc: "Postgres internals, LSM guides" },
                ].map((item, idx) => (
                  <div key={idx} className="border border-zinc-900 rounded-lg p-3 bg-zinc-900/20 text-left">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-zinc-800 text-[10px] text-zinc-300 font-mono">
                        #{item.tag}
                      </Badge>
                      <span className="text-[10px] text-zinc-500 font-semibold">{item.count} links</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2">{item.desc}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Tab 4: Collections */}
            <TabsContent value="collections" className="p-6">
              <div className="max-w-sm mx-auto flex flex-col gap-2">
                {[
                  { name: "Frontend Core", count: 24 },
                  { name: "Database Design", count: 14 },
                  { name: "Market Intelligence", count: 9 },
                  { name: "Articles for Reading List", count: 32 },
                ].map((col, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between border border-zinc-900 rounded-lg p-3 bg-zinc-900/20 text-left hover:border-zinc-800/80 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder className="h-4 w-4 text-zinc-600" />
                      <span className="text-xs font-semibold text-zinc-300">{col.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">{col.count} bookmarks</span>
                  </div>
                ))}
              </div>
            </TabsContent>

          </Tabs>
        </div>

      </div>
    </section>
  );
}
