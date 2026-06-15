// app/dashboard/page.tsx — protected workspace
// Middleware guarantees auth. No client-side auth check needed.

"use client";

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

// ── Empty states ───────────────────────────────────────────────────────────

function EmptyBookmarks() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-10 h-10 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4">
        <span className="text-zinc-300 dark:text-zinc-700 text-lg">+</span>
      </div>
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
        No bookmarks yet
      </p>
      <p className="text-xs text-zinc-400 max-w-xs">
        Paste any URL above. AI will read it, summarise it, and make it searchable.
      </p>
    </div>
  );
}

function EmptySearch({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
        No results for &ldquo;{query}&rdquo;
      </p>
      <p className="text-xs text-zinc-400">
        Try different words, or save more bookmarks first.
      </p>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useUser();
  const [urlInput, setUrlInput] = useState("");

  const { bookmarks, loading, error: bookmarkError, refresh } = useBookmarks();
  const { results, query, searching, error: searchError, search, clear } = useSearch();
  const { submit, submitting, error: createError } = useCreateBookmark(refresh);

  const isSearchMode = query.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!urlInput.trim()) return;
    submit(urlInput.trim());
    setUrlInput("");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
            Bookmark Brain
          </span>
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

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* URL input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            required
            disabled={submitting}
            className="flex-1"
          />
          <Button type="submit" disabled={submitting || !urlInput.trim()}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </form>

        {createError && (
          <p className="text-xs text-red-500 -mt-4">{createError}</p>
        )}

        {/* Search */}
        <SearchBar
          onSearch={search}
          onClear={clear}
          searching={searching}
          hasResults={isSearchMode}
        />

        {searchError && (
          <p className="text-xs text-red-500 -mt-4">{searchError}</p>
        )}

        <Separator />

        {/* Content area */}
        <section className="flex flex-col gap-3">
          {isSearchMode ? (
            <>
              <p className="text-xs text-zinc-400">
                {results.length > 0
                  ? `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`
                  : !searching
                  ? null
                  : "Searching…"}
              </p>
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
            <EmptyBookmarks />
          ) : (
            <>
              <p className="text-xs text-zinc-400">
                {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
              </p>
              {bookmarks.map((bm) => (
                <BookmarkCard key={bm.id} bookmark={bm} />
              ))}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
