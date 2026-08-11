"use client";

import { Copy, ExternalLink, FileText, MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Bookmark } from "@/types/bookmark";
import { EXAMPLE_URLS, getDomain, STATUS_BADGE, STATUS_LABEL, timeAgo } from "../_lib/dashboard-utils";

interface BookmarkLibraryProps {
  bookmarks: Bookmark[];
  loading: boolean;
  activeQuery: string;
  error: string | null;
  onQuickSave: (url: string) => void;
  onViewDetails: (bookmark: Bookmark) => void;
  onDelete: (id: string) => Promise<void>;
}

export function BookmarkLibrary({
  bookmarks,
  loading,
  activeQuery,
  error,
  onQuickSave,
  onViewDetails,
  onDelete,
}: BookmarkLibraryProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950">Bookmark Library</h2>
          <p className="mt-1 text-xs text-zinc-500">
            {activeQuery ? `Results for "${activeQuery}"` : "Newest first"}
          </p>
        </div>
        <Badge variant="outline" className="rounded-full border-zinc-200 text-zinc-500">
          {bookmarks.length}
        </Badge>
      </div>

      {error && (
        <div className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="divide-y divide-zinc-100">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <BookmarkCardSkeleton key={index} />)
        ) : bookmarks.length === 0 ? (
          <EmptyLibrary activeQuery={activeQuery} onQuickSave={onQuickSave} />
        ) : (
          bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onViewDetails={onViewDetails}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}

function BookmarkCard({
  bookmark,
  onViewDetails,
  onDelete,
}: {
  bookmark: Bookmark;
  onViewDetails: (bookmark: Bookmark) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const domain = getDomain(bookmark.url);
  const tags = bookmark.tags ?? [];

  async function copyUrl() {
    await navigator.clipboard.writeText(bookmark.url);
  }

  return (
    <article className="group p-5 transition hover:bg-zinc-50/70">
      <div className="flex gap-4">
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-cyan-700">
          {domain[0]?.toUpperCase() ?? "B"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-xs font-medium text-zinc-500">{domain}</span>
            <Badge className={`rounded-full border px-2 py-0 text-[10px] ${STATUS_BADGE[bookmark.status]}`}>
              {STATUS_LABEL[bookmark.status]}
            </Badge>
            <span className="text-xs text-zinc-400">{timeAgo(bookmark.created_at)}</span>
          </div>

          <button
            type="button"
            onClick={() => onViewDetails(bookmark)}
            className="mt-2 block max-w-3xl text-left text-base font-semibold leading-snug text-zinc-950 hover:text-cyan-700"
          >
            {bookmark.title || domain}
          </button>

          <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-zinc-600">
            {bookmark.summary ||
              (bookmark.status === "failed"
                ? bookmark.error_message || "Processing failed for this bookmark."
                : "AI summary will appear here after scraping, summarization, tagging, and embedding complete.")}
          </p>

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-full bg-zinc-100 text-[10px] text-zinc-600">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-start gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-md"
            onClick={() => window.open(bookmark.url, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="rounded-md" onClick={copyUrl}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="rounded-md" onClick={() => onViewDetails(bookmark)}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-md text-rose-500 hover:text-rose-600"
            onClick={() => {
              void onDelete(bookmark.id).catch(() => undefined);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function EmptyLibrary({
  activeQuery,
  onQuickSave,
}: {
  activeQuery: string;
  onQuickSave: (url: string) => void;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-zinc-400">
        <FileText className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-zinc-950">
        {activeQuery ? "No matching knowledge yet" : "Start building your AI knowledge base"}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {activeQuery
          ? "Try a different query, or save more sources before searching."
          : "Paste a URL above. The saved link will appear here immediately and update as the AI pipeline runs."}
      </p>
      {!activeQuery && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {EXAMPLE_URLS.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => onQuickSave(url)}
              className="max-w-full truncate rounded-full border border-zinc-200 px-3 py-1.5 font-mono text-[11px] text-zinc-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
            >
              {url}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarkCardSkeleton() {
  return (
    <div className="flex gap-4 p-5">
      <div className="h-9 w-9 rounded-lg bg-zinc-100" />
      <div className="flex-1 space-y-3">
        <div className="h-3 w-40 rounded bg-zinc-100" />
        <div className="h-4 w-3/4 rounded bg-zinc-100" />
        <div className="h-3 w-full rounded bg-zinc-100" />
        <div className="h-3 w-2/3 rounded bg-zinc-100" />
      </div>
    </div>
  );
}
