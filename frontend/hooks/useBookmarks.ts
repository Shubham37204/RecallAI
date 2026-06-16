// hooks/useBookmarks.ts
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { deleteBookmark, getBookmarks } from "@/lib/api";
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

  const fetch = useCallback(async () => {
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const data = await getBookmarks(token);
      setBookmarks(data);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bookmarks");
      return [];
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Auto-poll every 5s if any bookmark is pending/processing
  useEffect(() => {
    fetch();

    pollingRef.current = setInterval(async () => {
      const data = await fetch();
      const hasActive = data.some(
        (b) => b.status === "pending" || b.status === "processing"
      );
      if (!hasActive && pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetch]);

  // Restart polling when refresh is called
  const refresh = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setLoading(true);
    fetch().then((data) => {
      const hasActive = data.some(
        (b) => b.status === "pending" || b.status === "processing"
      );
      if (hasActive) {
        pollingRef.current = setInterval(async () => {
          const latest = await fetch();
          const stillActive = latest.some(
            (b) => b.status === "pending" || b.status === "processing"
          );
          if (!stillActive && pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }, 5000);
      }
    });
  }, [fetch]);

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
