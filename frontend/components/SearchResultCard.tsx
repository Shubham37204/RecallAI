"use client";

import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/types/bookmark";

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const label =
    pct >= 85 ? "High match" : pct >= 65 ? "Good match" : "Partial match";
  const color =
    pct >= 85
      ? "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800"
      : pct >= 65
      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      : "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium shrink-0 ${color}`}>
      <span className="font-mono">{pct}%</span>
      <span>{label}</span>
    </div>
  );
}

interface SearchResultCardProps {
  result: SearchResult;
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  const domain = (() => {
    try {
      return new URL(result.url).hostname;
    } catch {
      return result.url;
    }
  })();

  return (
    <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-3 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-2 truncate leading-snug"
            onClick={(e) => e.stopPropagation()}
          >
            {result.title ?? domain}
          </a>
          <span className="text-xs text-zinc-400 truncate">{domain}</span>
        </div>
        <ScoreBadge score={result.score} />
      </div>

      {result.summary && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {result.summary}
        </p>
      )}

      {(result.tags ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {(result.tags ?? []).slice(0, 4).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-2 py-0.5 font-normal bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
