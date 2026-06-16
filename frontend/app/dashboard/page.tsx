"use client";
// app/dashboard/page.tsx

import { SignOutButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "@/components/SearchBar";
import { BookmarkCard, BookmarkCardSkeleton } from "@/components/BookmarkCard";
import { SearchResultCard } from "@/components/SearchResultCard";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useSearch } from "@/hooks/useSearch";
import { useCreateBookmark } from "@/hooks/useCreateBookmark";

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar({
  bookmarks,
}: {
  bookmarks: { status: string }[];
}) {
  const total = bookmarks.length;
  const indexed = bookmarks.filter((b) => b.status === "completed").length;
  const processing = bookmarks.filter(
    (b) => b.status === "pending" || b.status === "processing"
  ).length;
  const failed = bookmarks.filter((b) => b.status === "failed").length;

  if (total === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-2">
      {[
        { label: "Total", value: total, color: "text-zinc-900 dark:text-zinc-100" },
        { label: "Indexed", value: indexed, color: "text-cyan-600 dark:text-cyan-400" },
        { label: "Processing", value: processing, color: "text-blue-600 dark:text-blue-400" },
        { label: "Failed", value: failed, color: "text-red-500 dark:text-red-400" },
      ].map(({ label, value, color }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-0.5 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
        >
          <span className={`text-lg font-semibold tabular-nums ${color}`}>
            {value}
          </span>
          <span className="text-xs text-zinc-400">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

const EXAMPLE_URLS = [
  "https://lilianweng.github.io/posts/2023-06-23-agent/",
  "https://docs.docker.com/compose/",
  "https://fastapi.tiangolo.com/tutorial/",
];

function EmptyState({ onSubmit }: { onSubmit: (url: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="w-12 h-12 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800 flex items-center justify-center">
        <span className="text-blue-400 text-xl">✦</span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Build your AI knowledge base
        </p>
        <p className="text-xs text-zinc-400 max-w-xs">
          Paste any article, research paper, documentation page, or blog post.
          AI reads it, summarises it, and makes it searchable.
        </p>
      </div>
      <div className="flex flex-col gap-1.5 w-full max-w-sm">
        <p className="text-xs text-zinc-400">Try these examples:</p>
        {EXAMPLE_URLS.map((url) => (
          <button
            key={url}
            onClick={() => onSubmit(url)}
            className="text-xs px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-left truncate"
          >
            {url}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptySearch({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        No results for &ldquo;{query}&rdquo;
      </p>
      <p className="text-xs text-zinc-400">
        Try different words, or save more bookmarks first.
      </p>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useUser();
  const [urlInput, setUrlInput] = useState("");

  const { bookmarks, loading, error: bookmarkError, refresh, remove } = useBookmarks();
  const { results, query, searching, error: searchError, search, clear } = useSearch();
  const { submit, submitting, error: createError } = useCreateBookmark(refresh);

  const isSearchMode = query.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!urlInput.trim()) return;
    submit(urlInput.trim());
    setUrlInput("");
  }

  function handleExampleSubmit(url: string) {
    submit(url);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">✦</span>
            <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              Bookmark Brain
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user?.primaryEmailAddress?.emailAddress && (
              <span className="text-xs text-zinc-400 hidden sm:block">
                {user.primaryEmailAddress.emailAddress}
              </span>
            )}
            <SignOutButton redirectUrl="/">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-500">
                Sign out
              </Button>
            </SignOutButton>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-5">

        {/* URL input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste any URL to save and index…"
            required
            disabled={submitting}
            className="flex-1 border-zinc-200 dark:border-zinc-700 focus-visible:ring-blue-500"
          />
          <Button
            type="submit"
            disabled={submitting || !urlInput.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting ? "Saving…" : "Save"}
          </Button>
        </form>

        {createError && (
          <p className="text-xs text-red-500 -mt-3">{createError}</p>
        )}

        {/* Stats */}
        {!loading && <StatsBar bookmarks={bookmarks} />}

        {/* Search */}
        <SearchBar
          onSearch={search}
          onClear={clear}
          searching={searching}
          hasResults={isSearchMode}
        />

        {searchError && (
          <p className="text-xs text-red-500 -mt-3">{searchError}</p>
        )}

        <Separator />

        {/* Content */}
        <section className="flex flex-col gap-3">
          {isSearchMode ? (
            <>
              {!searching && results.length > 0 && (
                <p className="text-xs text-zinc-400">
                  {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
                </p>
              )}
              {searching ? (
                <>
                  <BookmarkCardSkeleton />
                  <BookmarkCardSkeleton />
                </>
              ) : results.length === 0 ? (
                <EmptySearch query={query} />
              ) : (
                results.map((r) => (
                  <SearchResultCard key={r.bookmark_id} result={r} />
                ))
              )}
            </>
          ) : loading ? (
            <>
              <BookmarkCardSkeleton />
              <BookmarkCardSkeleton />
              <BookmarkCardSkeleton />
            </>
          ) : bookmarkError ? (
            <p className="text-xs text-red-500">{bookmarkError}</p>
          ) : bookmarks.length === 0 ? (
            <EmptyState onSubmit={handleExampleSubmit} />
          ) : (
            <>
              <p className="text-xs text-zinc-400">
                {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
              </p>
              {bookmarks.map((bm) => (
                <BookmarkCard key={bm.id} bookmark={bm} onDelete={remove} />
              ))}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
