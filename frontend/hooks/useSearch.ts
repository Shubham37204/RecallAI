import { useAuth } from "@clerk/nextjs";
import { useCallback, useRef, useState } from "react";
import { CLERK_TOKEN_TEMPLATE, getBookmark, getErrorMessage, searchBookmarks } from "@/lib/api";
import type { Bookmark } from "@/types/bookmark";

interface UseSearchResult {
  results: Bookmark[];
  query: string;
  searching: boolean;
  error: string | null;
  search: (q: string) => Promise<void>;
  clear: () => void;
}

export function useSearch(): UseSearchResult {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [results, setResults] = useState<Bookmark[]>([]);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const search = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setResults([]);
        setQuery("");
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setSearching(true);
      setError(null);
      setQuery(trimmed);

      try {
        if (!isLoaded || !isSignedIn) throw new Error("Not authenticated");
        const token = await getToken({ template: CLERK_TOKEN_TEMPLATE });
        if (!token) throw new Error("Not authenticated");
        const data = await searchBookmarks(token, trimmed, 10, controller.signal);
        const bookmarks = await Promise.all(
          data.results.map((result) =>
            getBookmark(token, result.bookmark_id, controller.signal)
          )
        );
        if (requestId === requestIdRef.current) {
          setResults(bookmarks);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (requestId === requestIdRef.current) {
          setError(getErrorMessage(e));
          setResults([]);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setSearching(false);
        }
      }
    },
    [getToken, isLoaded, isSignedIn]
  );

  const clear = useCallback(() => {
    abortRef.current?.abort();
    requestIdRef.current += 1;
    setResults([]);
    setQuery("");
    setError(null);
    setSearching(false);
  }, []);

  return { results, query, searching, error, search, clear };
}
