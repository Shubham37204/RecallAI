"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Search, 
  Tag, 
  Archive, 
  FileText, 
  Clock, 
  Database,
  ArrowRight
} from "lucide-react";

export default function FeatureShowcase() {
  return (
    <section id="features" className="w-full bg-zinc-50/50 py-20 dark:bg-zinc-900/10 border-y border-zinc-100 dark:border-zinc-900">
      <div className="mx-auto max-w-5xl px-6 space-y-24">
        
        {/* Title */}
        <div className="text-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Product Capabilities
          </span>
          <h3 className="mt-2 text-2xl font-medium tracking-tight text-zinc-905 dark:text-zinc-50">
            Everything you need for a digital brain
          </h3>
        </div>

        {/* Feature 1: AI Summaries */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 items-center">
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-900">
              <Sparkles className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h4 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
              AI Summaries
            </h4>
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Bookmark Brain automatically reads every page you save. In seconds, it extracts the core thesis, key takeaways, and reading time so you don't have to re-read the entire article to remember what it was about.
            </p>
          </div>
          <div className="md:col-span-7">
            <Card className="p-4 border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-2 dark:border-zinc-900">
                <FileText className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">"Designing Data-Intensive Applications"</span>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>12 min read summary • Generated instantly</span>
                </div>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 p-2.5 rounded dark:bg-zinc-900/30">
                  Explore how databases store, retrieve, and process query operations. Explores indexing (SSTables, LSM-trees vs B-trees) and storage engines.
                </p>
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Key Takeaway</span>
                  <div className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-zinc-900 dark:bg-zinc-400" />
                    <span>LSM-trees are optimized for writes; B-trees are faster for read queries.</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Feature 2: Semantic Search */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 items-center">
          <div className="md:col-span-7 order-last md:order-first">
            <Card className="p-4 border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-2 dark:border-zinc-900">
                <Search className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-500">Query: "How does Postgres build indexes?"</span>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <div className="rounded border border-zinc-100 p-2 bg-zinc-50/30 dark:border-zinc-900 dark:bg-zinc-900/10">
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>postgresguides.com/indexes</span>
                    <span className="text-emerald-600 dark:text-emerald-400">97% match</span>
                  </div>
                  <h5 className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 mt-0.5">Understanding B-Tree Indexes in PostgreSQL</h5>
                  <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 mt-1">
                    "...Postgres uses B-Tree indexes as the default because they keep data sorted and allow binary search in O(log n) time..."
                  </p>
                </div>
              </div>
            </Card>
          </div>
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-900">
              <Search className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h4 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
              Semantic Search
            </h4>
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Forget scrolling through files matching exact tags or terms. Search by description or concept: if you ask for "distributed consensus," we'll surface matching guides, even if those exact words are never mentioned in the title.
            </p>
          </div>
        </div>

        {/* Feature 3: Auto Tagging */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 items-center">
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-900">
              <Tag className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h4 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
              Auto Tagging
            </h4>
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Stop organizing bookmarks manually. Our AI extracts core entities, topics, and languages from saved items and automatically applies tags, grouping similar links together in dynamic collections.
            </p>
          </div>
          <div className="md:col-span-7">
            <Card className="p-4 border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Scraping URL and extracting topics...</span>
                <div className="rounded-md border border-zinc-100 p-3 bg-zinc-50/50 dark:border-zinc-900 dark:bg-zinc-900/30">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">"An introduction to neural network transformers"</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-zinc-400 self-center">Identified tags:</span>
                    <Badge className="rounded text-[9px] px-1.5 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900">Machine Learning</Badge>
                    <Badge className="rounded text-[9px] px-1.5 bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900">AI Architecture</Badge>
                    <Badge className="rounded text-[9px] px-1.5 bg-zinc-100 text-zinc-600 border-none dark:bg-zinc-900 dark:text-zinc-400">NLP</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Feature 4: Knowledge Archive */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 items-center">
          <div className="md:col-span-7 order-last md:order-first">
            <Card className="p-4 border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-900">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Offline Vault</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">Snapshot Archived</span>
              </div>
              <div className="mt-3 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Saved copy of original page text</span>
                  <span>421 KB</span>
                </div>
                <div className="mt-1 rounded bg-zinc-50 p-2 text-[10px] text-zinc-400 dark:bg-zinc-900/60 font-mono">
                  &lt;html&gt;&lt;body&gt; The core concept of distributed snapshots is to record...
                </div>
              </div>
            </Card>
          </div>
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-900">
              <Archive className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h4 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
              Knowledge Archive
            </h4>
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Links break, pages get taken down, and sites change domain. Bookmark Brain keeps a clean markdown archive of the page content, ensuring that your reference material remains permanently readable and searchable in your archive.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
