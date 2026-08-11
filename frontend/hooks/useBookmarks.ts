import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { CLERK_TOKEN_TEMPLATE, deleteBookmark, getBookmarks, getErrorMessage } from "@/lib/api";
import type { Bookmark } from "@/types/bookmark";

interface UseBookmarksResult {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  remove: (id: string) => Promise<void>;
}

export function useBookmarks(): UseBookmarksResult {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialLoadRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetch = useCallback(async () => {
    if (!isLoaded) return [];

    setError(null);
    try {
      if (!isSignedIn) throw new Error("Not authenticated");
      const token = await getToken({ template: CLERK_TOKEN_TEMPLATE });
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
  }, [getToken, isLoaded, isSignedIn]);

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
    if (!isLoaded) return;

    initialLoadRef.current = setTimeout(() => {
      void loadAndMaybePoll();
    }, 0);
    return () => {
      if (initialLoadRef.current) {
        clearTimeout(initialLoadRef.current);
      }
      stopPolling();
    };
  }, [isLoaded, loadAndMaybePoll, stopPolling]);

  const refresh = useCallback(() => {
    stopPolling();
    setLoading(true);
    void loadAndMaybePoll();
  }, [loadAndMaybePoll, stopPolling]);

  const remove = useCallback(
    async (id: string) => {
      setError(null);
      try {
        if (!isLoaded || !isSignedIn) throw new Error("Not authenticated");
        const token = await getToken({ template: CLERK_TOKEN_TEMPLATE });
        if (!token) throw new Error("Not authenticated");
        await deleteBookmark(token, id);
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      }
    },
    [getToken, isLoaded, isSignedIn]
  );

  return { bookmarks, loading, error, refresh, remove };
}
