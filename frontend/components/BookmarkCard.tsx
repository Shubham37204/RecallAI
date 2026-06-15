// components/BookmarkCard.tsx
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Bookmark } from "@/types/bookmark";

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  processing:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  completed:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  failed:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  processing: "Processing…",
  completed: "Done",
  failed: "Failed",
};

interface BookmarkCardProps {
  bookmark: Bookmark;
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const isProcessing =
    bookmark.status === "pending" || bookmark.status === "processing";

  return (
    <div className="group p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-3 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-2 truncate leading-snug"
        >
          {bookmark.title ?? new URL(bookmark.url).hostname}
        </a>
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[bookmark.status] ?? ""}`}
        >
          {STATUS_LABEL[bookmark.status] ?? bookmark.status}
        </span>
      </div>

      {/* URL */}
      <p className="text-xs text-zinc-400 truncate">{bookmark.url}</p>

      {/* Summary or skeleton */}
      {isProcessing ? (
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ) : bookmark.summary ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {bookmark.summary}
        </p>
      ) : null}

      {/* Tags */}

      {(bookmark.tags ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {(bookmark.tags ?? []).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-2 py-0.5 font-normal"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Error */}
      {bookmark.status === "failed" && bookmark.error_message && (
        <p className="text-xs text-red-500 dark:text-red-400">
          {bookmark.error_message}
        </p>
      )}
    </div>
  );
}

export function BookmarkCardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-32" />
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
