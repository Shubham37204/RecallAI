export type BookmarkStatus = "pending" | "processing" | "completed" | "failed";

export interface Bookmark {
  id: string;
  url: string;
  title: string | null;
  status: BookmarkStatus;
  summary: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  error_message: string | null;
  content_length?: number | null;
  completed_at: string | null;
}

export interface BookmarkCreateResponse {
  id: string;
  status: BookmarkStatus;
  message: string;
}

export interface SearchResult {
  bookmark_id: string;
  url: string;
  title: string | null;
  summary: string | null;
  tags: string[] | null;
  score: number;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResult[];
}

export interface BookmarkStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
}
