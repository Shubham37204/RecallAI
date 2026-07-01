// hooks/useBookmarks.ts
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { deleteBookmark, getBookmarks, getErrorMessage } from "@/lib/api";
import type { Bookmark } from "@/types/bookmark";

interface UseBookmarksResult {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  remove: (id: string) => Promise<void>;
}

export function useBookmarks(): UseBookmarksResult {
  const { getToken } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialLoadRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetch = useCallback(async () => {
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const data = await getBookmarks(token);
      setBookmarks(data);
      return data;
    } catch (e) {
      setError(getErrorMessage(e));
      return [];
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      const latest = await fetch();
      const stillActive = latest.some(
        (b) => b.status === "pending" || b.status === "processing",
      );
      if (!stillActive) stopPolling();
    }, 5000);
  }, [fetch, stopPolling]);

  const loadAndMaybePoll = useCallback(async () => {
    const data = await fetch();
    const hasActive = data.some(
      (b) => b.status === "pending" || b.status === "processing",
    );
    if (hasActive) startPolling();
    return data;
  }, [fetch, startPolling]);

  useEffect(() => {
    initialLoadRef.current = setTimeout(() => {
      void loadAndMaybePoll();
    }, 0);
    return () => {
      if (initialLoadRef.current) {
        clearTimeout(initialLoadRef.current);
      }
      stopPolling();
    };
  }, [loadAndMaybePoll, stopPolling]);

  const refresh = useCallback(() => {
    stopPolling();
    setLoading(true);
    void loadAndMaybePoll();
  }, [loadAndMaybePoll, stopPolling]);

  const remove = useCallback(
    async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await deleteBookmark(token, id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    },
    [getToken]
  );

  return { bookmarks, loading, error, refresh, remove };
}
