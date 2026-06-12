// types/bookmark.ts
// Matches backend Pydantic schemas exactly.
// Update here if backend response shapes change.

export type BookmarkStatus = "pending" | "processing" | "completed" | "failed";

export interface Bookmark {
  id: string;
  url: string;
  title: string | null;
  status: BookmarkStatus;
  summary: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  error_message: string | null;
  content_length: number | null;
  completed_at: string | null;
}

export interface BookmarkCreateResponse {
  id: string;
  url: string;
  status: BookmarkStatus;
}

export interface SearchResult {
  bookmark_id: string;
  url: string;
  title: string | null;
  summary: string | null;
  tags: string[];
  score: number;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResult[];
}
