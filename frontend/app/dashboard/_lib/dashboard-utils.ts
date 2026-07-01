import type { BookmarkStatus } from "@/types/bookmark";

export const EXAMPLE_URLS = [
  "https://lilianweng.github.io/posts/2023-06-23-agent/",
  "https://docs.docker.com/compose/",
  "https://fastapi.tiangolo.com/",
];

export const SEARCH_EXAMPLES = [
  "What did I save about Docker?",
  "vector database",
  "postgres indexing",
  "agent memory",
];

export const STATUS_LABEL: Record<BookmarkStatus, string> = {
  pending: "Queued",
  processing: "Processing",
  completed: "Processed",
  failed: "Failed",
};

export const STATUS_BADGE: Record<BookmarkStatus, string> = {
  pending: "border-cyan-200 bg-cyan-50 text-cyan-700",
  processing: "border-blue-200 bg-blue-50 text-blue-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
};

export function normalizeUrlInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
