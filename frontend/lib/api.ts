// lib/api.ts
import type {
  Bookmark,
  BookmarkCreateResponse,
  BookmarkStats,
  SearchResponse,
} from "@/types/bookmark";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchWithAuth<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(
      detail?.detail?.message ?? detail?.detail ?? `HTTP ${res.status}`
    );
  }

  return res.json() as Promise<T>;
}

export async function getBookmarks(token: string): Promise<Bookmark[]> {
  return fetchWithAuth<Bookmark[]>("/bookmarks", token);
}

export async function createBookmark(
  token: string,
  url: string
): Promise<BookmarkCreateResponse> {
  return fetchWithAuth<BookmarkCreateResponse>("/bookmarks", token, {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function deleteBookmark(
  token: string,
  bookmarkId: string
): Promise<void> {
  await fetchWithAuth<void>(`/bookmarks/${bookmarkId}`, token, {
    method: "DELETE",
  });
}

export async function searchBookmarks(
  token: string,
  query: string,
  limit = 10
): Promise<SearchResponse> {
  return fetchWithAuth<SearchResponse>("/search", token, {
    method: "POST",
    body: JSON.stringify({ q: query, limit }),
  });
}

export async function getBookmarkStats(
  token: string
): Promise<BookmarkStats> {
  const bookmarks = await getBookmarks(token);
  const total = bookmarks.length;
  const completed = bookmarks.filter((b) => b.status === "completed").length;
  const pending = bookmarks.filter(
    (b) => b.status === "pending" || b.status === "processing"
  ).length;
  const failed = bookmarks.filter((b) => b.status === "failed").length;
  return { total, completed, pending, failed };
}
