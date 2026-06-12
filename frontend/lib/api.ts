// lib/api.ts
// Typed API client for all backend calls.
// All functions throw on non-2xx — callers handle errors.
// token: Clerk JWT, passed from useAuth().getToken()

import type {
  Bookmark,
  BookmarkCreateResponse,
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

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(
      detail?.detail?.message ?? detail?.detail ?? `HTTP ${res.status}`
    );
  }

  return res.json() as Promise<T>;
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────

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

export async function getBookmarkStatus(
  token: string,
  bookmarkId: string
): Promise<{ id: string; status: string }> {
  return fetchWithAuth(`/bookmarks/${bookmarkId}/status`, token);
}

// ── Search ────────────────────────────────────────────────────────────────────

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
