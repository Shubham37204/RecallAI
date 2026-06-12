// hooks/useBookmarks.ts
// Fetches the user's bookmark list.
// Re-fetches when refresh() is called (e.g. after creating a bookmark).

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { getBookmarks } from "@/lib/api";
import type { Bookmark } from "@/types/bookmark";

interface UseBookmarksResult {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBookmarks(): UseBookmarksResult {
  const { getToken } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const data = await getBookmarks(token);
      setBookmarks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { bookmarks, loading, error, refresh: fetch };
}
