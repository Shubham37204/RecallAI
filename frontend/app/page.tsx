// app/page.tsx
// Orchestrates all state. Owns data flow.
// SearchBar emits query → page calls search hook → results replace list.
// Clear → back to bookmark list.

"use client";

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useSearch } from "@/hooks/useSearch";
import { useCreateBookmark } from "@/hooks/useCreateBookmark";
import type { Bookmark, SearchResult } from "@/types/bookmark";

// ── Inline bookmark item — extract to BookmarkCard.tsx when > 30 lines ────────

function BookmarkItem({ bookmark }: { bookmark: Bookmark }) {
  const statusColor: Record<string, string> = {
    pending: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
    processing: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    completed: "text-green-700 bg-green-50 dark:bg-green-900/20",
    failed: "text-red-600 bg-red-50 dark:bg-red-900/20",
  };

  return (
    <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline truncate"
        >
          {bookmark.title ?? bookmark.url}
        </a>
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[bookmark.status] ?? ""}`}
        >
          {bookmark.status}
        </span>
      </div>
      {bookmark.summary && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {bookmark.summary}
        </p>
      )}
      {bookmark.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {bookmark.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {bookmark.status === "failed" && bookmark.error_message && (
        <p className="text-xs text-red-500">{bookmark.error_message}</p>
      )}
    </div>
  );
}

function SearchResultItem({ result }: { result: SearchResult }) {
  return (
    <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline truncate"
        >
          {result.title ?? result.url}
        </a>
        <span className="shrink-0 text-xs text-zinc-400 font-mono">
          {(result.score * 100).toFixed(0)}%
        </span>
      </div>
      {result.summary && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {result.summary}
        </p>
      )}
      {result.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {result.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [urlInput, setUrlInput] = useState("");

  const { bookmarks, loading, error: bookmarkError, refresh } = useBookmarks();
  const { results, query, searching, error: searchError, search, clear } = useSearch();
  const { submit, submitting, error: createError } = useCreateBookmark(refresh);

  const isSearchMode = query.length > 0;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400 text-sm">
        Loading…
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Bookmark Brain
        </h1>
        <p className="text-zinc-500 text-sm">Save and search your bookmarks with AI.</p>
        <SignInButton mode="modal">
          <button className="px-6 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 transition-colors">
            Sign in
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            Bookmark Brain
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">
              {user.primaryEmailAddress?.emailAddress}
            </span>
            <SignOutButton>
              <button className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Add bookmark */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(urlInput);
            setUrlInput("");
          }}
          className="flex gap-2"
        >
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            required
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-sm"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !urlInput.trim()}
            className="px-4 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium disabled:opacity-40 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
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

        {/* Results / List */}
        <section className="flex flex-col gap-3">
          {isSearchMode ? (
            <>
              <p className="text-xs text-zinc-400">
                {results.length === 0 && !searching
                  ? `No results for "${query}"`
                  : `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`}
              </p>
              {results.map((r) => (
                <SearchResultItem key={r.bookmark_id} result={r} />
              ))}
            </>
          ) : loading ? (
            <p className="text-xs text-zinc-400">Loading bookmarks…</p>
          ) : bookmarkError ? (
            <p className="text-xs text-red-500">{bookmarkError}</p>
          ) : bookmarks.length === 0 ? (
            <p className="text-xs text-zinc-400">
              No bookmarks yet. Paste a URL above to get started.
            </p>
          ) : (
            bookmarks.map((bm) => <BookmarkItem key={bm.id} bookmark={bm} />)
          )}
        </section>
      </main>
    </div>
  );
}
