import { useAuth } from "@clerk/nextjs";
import { useCallback, useState } from "react";
import { createBookmark, getErrorMessage } from "@/lib/api";
import type { BookmarkCreateResponse } from "@/types/bookmark";

interface UseCreateBookmarkResult {
  submit: (url: string) => Promise<BookmarkCreateResponse | null>;
  submitting: boolean;
  error: string | null;
}

export function useCreateBookmark(onSuccess?: () => void): UseCreateBookmarkResult {
  const { getToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (url: string) => {
      const trimmed = url.trim();
      if (!trimmed) return null;

      setSubmitting(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        const bookmark = await createBookmark(token, trimmed);
        onSuccess?.();
        return bookmark;
      } catch (e) {
        setError(getErrorMessage(e));
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [getToken, onSuccess]
  );

  return { submit, submitting, error };
}
