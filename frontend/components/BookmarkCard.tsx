"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Bookmark } from "@/types/bookmark";

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  processing:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  completed:
    "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800",
  failed:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  processing: "Processing…",
  completed: "Indexed",
  failed: "Failed",
};

const PIPELINE_STEPS = [
  "Scraping content",
  "Cleaning text",
  "Generating summary",
  "Extracting tags",
  "Creating embeddings",
];

function ProcessingTimeline({ status }: { status: string }) {
  if (status !== "pending" && status !== "processing") return null;
  return (
    <div className="flex flex-col gap-1.5 py-1">
      {PIPELINE_STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              status === "processing" && i === 0
                ? "bg-blue-500 animate-pulse"
                : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          />
          <span
            className={`text-xs ${
              status === "processing" && i === 0
                ? "text-blue-600 dark:text-blue-400"
                : "text-zinc-400"
            }`}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}

function BookmarkDrawer({
  bookmark,
  onClose,
  onDelete,
}: {
  bookmark: Bookmark;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
      onClose();
    }
  }

  const domain = (() => {
    try {
      return new URL(bookmark.url).hostname;
    } catch {
      return bookmark.url;
    }
  })();

  const savedAt = new Date(bookmark.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Bookmark Details
          </span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                {bookmark.title ?? domain}
              </h2>
              <span
                className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${
                  STATUS_STYLES[bookmark.status] ?? ""
                }`}
              >
                {STATUS_LABEL[bookmark.status] ?? bookmark.status}
              </span>
            </div>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700 truncate"
            >
              {bookmark.url}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Source", value: domain },
              { label: "Saved", value: savedAt },
              {
                label: "Content",
                value: bookmark.content_length
                  ? `${(bookmark.content_length / 1000).toFixed(1)}k chars`
                  : "—",
              },
              {
                label: "Status",
                value: STATUS_LABEL[bookmark.status] ?? bookmark.status,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-0.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800"
              >
                <span className="text-xs text-zinc-400">{label}</span>
                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {bookmark.summary && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                AI Summary
              </span>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {bookmark.summary}
              </p>
            </div>
          )}

          {(bookmark.tags ?? []).length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(bookmark.tags ?? []).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs font-normal bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {bookmark.status === "failed" && bookmark.error_message && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-600 dark:text-red-400">
                {bookmark.error_message}
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open(bookmark.url, "_blank")}
          >
            Open original
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(bookmark.url)}
          >
            Copy link
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </>
  );
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: string) => Promise<void>;
}

export function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isProcessing =
    bookmark.status === "pending" || bookmark.status === "processing";

  const domain = (() => {
    try {
      return new URL(bookmark.url).hostname;
    } catch {
      return bookmark.url;
    }
  })();

  return (
    <>
      <div
        className="group p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-3 hover:border-blue-200 dark:hover:border-blue-800 transition-colors cursor-pointer"
        onClick={() => setDrawerOpen(true)}
      >
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate leading-snug">
              {bookmark.title ?? domain}
            </span>
            <span className="text-xs text-zinc-400 truncate">{domain}</span>
          </div>
          <span
            className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${
              STATUS_STYLES[bookmark.status] ?? ""
            }`}
          >
            {STATUS_LABEL[bookmark.status] ?? bookmark.status}
          </span>
        </div>

        {isProcessing ? (
          <ProcessingTimeline status={bookmark.status} />
        ) : bookmark.summary ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {bookmark.summary}
          </p>
        ) : null}

        {(bookmark.tags ?? []).length > 0 && !isProcessing && (
          <div className="flex flex-wrap gap-1">
            {(bookmark.tags ?? []).slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-2 py-0.5 font-normal bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900"
              >
                {tag}
              </Badge>
            ))}
            {(bookmark.tags ?? []).length > 4 && (
              <span className="text-xs text-zinc-400 self-center">
                +{(bookmark.tags ?? []).length - 4}
              </span>
            )}
          </div>
        )}

        <div className="hidden group-hover:flex items-center gap-1 text-xs text-blue-500">
          <span>View details →</span>
        </div>
      </div>

      {drawerOpen && (
        <BookmarkDrawer
          bookmark={bookmark}
          onClose={() => setDrawerOpen(false)}
          onDelete={() => onDelete(bookmark.id)}
        />
      )}
    </>
  );
}

export function BookmarkCardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}
