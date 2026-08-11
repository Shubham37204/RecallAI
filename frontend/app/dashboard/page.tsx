"use client";

import { useEffect, useMemo, useState } from "react";
import type { Bookmark } from "@/types/bookmark";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useCreateBookmark } from "@/hooks/useCreateBookmark";
import { useSearch } from "@/hooks/useSearch";
import { BookmarkDetailDrawer } from "./_components/BookmarkDetailDrawer";
import { DashboardFooter } from "./_components/DashboardFooter";
import { BookmarkLibrary } from "./_components/BookmarkLibrary";
import { DashboardStats } from "./_components/DashboardStats";
import { DashboardTopNav } from "./_components/DashboardTopNav";
import { SemanticSearchPanel } from "./_components/SemanticSearchPanel";
import { UrlSubmitCard } from "./_components/UrlSubmitCard";

export default function DashboardPage() {
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);

  const {
    bookmarks,
    loading,
    error: bookmarkError,
    refresh,
    remove,
  } = useBookmarks();
  const {
    results,
    query,
    searching,
    error: searchError,
    search,
    clear,
  } = useSearch();
  const {
    submit,
    submitting,
    error: createError,
  } = useCreateBookmark(refresh);

  const stats = useMemo(() => {
    const processed = bookmarks.filter((bookmark) => bookmark.status === "completed").length;
    const processing = bookmarks.filter(
      (bookmark) => bookmark.status === "pending" || bookmark.status === "processing",
    ).length;
    const failed = bookmarks.filter((bookmark) => bookmark.status === "failed").length;

    return {
      total: bookmarks.length,
      processed,
      processing,
      failed,
    };
  }, [bookmarks]);

  const visibleBookmarks = useMemo(() => {
    if (!query) return bookmarks;
    return results;
  }, [bookmarks, query, results]);

  useEffect(() => {
    if (!selectedBookmark) return;
    const latestBookmark = bookmarks.find((bookmark) => bookmark.id === selectedBookmark.id);
    if (latestBookmark) {
      setSelectedBookmark(latestBookmark);
    }
  }, [bookmarks, selectedBookmark]);

  async function handleSubmitUrl(url: string) {
    const created = await submit(url);
    if (!created) return false;
    clear();
    return true;
  }

  async function handleQuickSave(url: string) {
    await handleSubmitUrl(url);
  }

  async function handleDelete(bookmarkId: string) {
    await remove(bookmarkId);
    setSelectedBookmark((current) => (current?.id === bookmarkId ? null : current));
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <DashboardTopNav />

      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-6">
        <UrlSubmitCard
          submitting={submitting}
          submitError={createError}
          onSubmit={handleSubmitUrl}
        />

        <DashboardStats {...stats} />

        <SemanticSearchPanel
          query={query}
          searching={searching}
          error={searchError}
          onSearch={search}
          onClear={clear}
        />

        <BookmarkLibrary
          bookmarks={visibleBookmarks}
          loading={loading || searching}
          activeQuery={query}
          error={bookmarkError}
          onQuickSave={handleQuickSave}
          onViewDetails={setSelectedBookmark}
          onDelete={handleDelete}
        />
      </main>

      <DashboardFooter />

      <BookmarkDetailDrawer
        bookmark={selectedBookmark}
        onClose={() => setSelectedBookmark(null)}
        onDelete={handleDelete}
      />
    </div>
  );
}
