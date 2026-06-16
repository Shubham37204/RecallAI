// lib/api.ts
// Parses structured error responses from backend.
// Every AppError returns { error_code, category, message, action, retryable }.
// Generic errors fall back to HTTP status text.

import type {
  Bookmark,
  BookmarkCreateResponse,
  SearchResponse,
} from "@/types/bookmark";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Structured error from backend ─────────────────────────────────────────────

export interface ApiError {
  error_code: string;
  category: "transient" | "quota" | "degraded";
  message: string;
  action: string;
  retryable: boolean;
}

export class AppApiError extends Error {
  constructor(
    public readonly apiError: ApiError,
    public readonly status: number
  ) {
    super(apiError.message);
  }

  /** Full user-facing string: message + action hint */
  get userMessage(): string {
    return `${this.apiError.message} ${this.apiError.action}`;
  }

  get isQuota(): boolean {
    return this.apiError.category === "quota";
  }

  get isRetryable(): boolean {
    return this.apiError.retryable;
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

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
    const body = await res.json().catch(() => ({}));

    // Structured AppError from backend
    if (body?.error_code) {
      throw new AppApiError(body as ApiError, res.status);
    }

    // FastAPI validation error (422)
    if (body?.detail) {
      const detail =
        typeof body.detail === "string"
          ? body.detail
          : Array.isArray(body.detail)
          ? body.detail.map((d: { msg: string }) => d.msg).join(", ")
          : "Invalid request";
      throw new Error(detail);
    }

    throw new Error(`HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Error message helper for hooks ────────────────────────────────────────────

export function getErrorMessage(e: unknown): string {
  if (e instanceof AppApiError) {
    return e.userMessage;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return "An unexpected error occurred.";
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

export async function deleteBookmark(
  token: string,
  bookmarkId: string
): Promise<void> {
  await fetchWithAuth<void>(`/bookmarks/${bookmarkId}`, token, {
    method: "DELETE",
  });
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
