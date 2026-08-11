import { useAuth } from "@clerk/nextjs";
import { useCallback, useState } from "react";
import { CLERK_TOKEN_TEMPLATE, createBookmark, getErrorMessage } from "@/lib/api";
import type { BookmarkCreateResponse } from "@/types/bookmark";

interface UseCreateBookmarkResult {
  submit: (url: string) => Promise<BookmarkCreateResponse | null>;
  submitting: boolean;
  error: string | null;
}

export function useCreateBookmark(onSuccess?: () => void): UseCreateBookmarkResult {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (url: string) => {
      const trimmed = url.trim();
      if (!trimmed) return null;

      setSubmitting(true);
      setError(null);

      try {
        if (!isLoaded || !isSignedIn) throw new Error("Not authenticated");
        const token = await getToken({ template: CLERK_TOKEN_TEMPLATE });
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
    [getToken, isLoaded, isSignedIn, onSuccess]
  );

  return { submit, submitting, error };
}
