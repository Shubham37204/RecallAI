// hooks/useSearch.ts
// Runs semantic search against POST /search.
// Returns results, loading state, and the active query.
// Clears results when query is empty.

import { useAuth } from "@clerk/nextjs";
import { useCallback, useState } from "react";
import { searchBookmarks } from "@/lib/api";
import type { SearchResult } from "@/types/bookmark";

interface UseSearchResult {
  results: SearchResult[];
  query: string;
  searching: boolean;
  error: string | null;
  search: (q: string) => Promise<void>;
  clear: () => void;
}

export function useSearch(): UseSearchResult {
  const { getToken } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setResults([]);
        setQuery("");
        return;
      }

      setSearching(true);
      setError(null);
      setQuery(trimmed);

      try {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        const data = await searchBookmarks(token, trimmed);
        setResults(data.results);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    [getToken]
  );

  const clear = useCallback(() => {
    setResults([]);
    setQuery("");
    setError(null);
  }, []);

  return { results, query, searching, error, search, clear };
}
