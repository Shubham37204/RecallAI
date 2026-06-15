// components/SearchResultCard.tsx
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/types/bookmark";

interface SearchResultCardProps {
  result: SearchResult;
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  const scorePercent = Math.round(result.score * 100);

  return (
    <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-3 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-2 truncate leading-snug"
        >
          {result.title ?? new URL(result.url).hostname}
        </a>
        <span className="shrink-0 text-xs font-mono text-zinc-400 tabular-nums">
          {scorePercent}%
        </span>
      </div>

      <p className="text-xs text-zinc-400 truncate">{result.url}</p>

      {result.summary && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {result.summary}
        </p>
      )}

      {result.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {result.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
