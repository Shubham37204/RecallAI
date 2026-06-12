// hooks/useCreateBookmark.ts
// Submits a URL to POST /bookmarks.
// onSuccess callback lets page.tsx trigger a bookmark list refresh.

import { useAuth } from "@clerk/nextjs";
import { useCallback, useState } from "react";
import { createBookmark } from "@/lib/api";

interface UseCreateBookmarkResult {
  submit: (url: string) => Promise<void>;
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
      if (!trimmed) return;

      setSubmitting(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        await createBookmark(token, trimmed);
        onSuccess?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save bookmark");
      } finally {
        setSubmitting(false);
      }
    },
    [getToken, onSuccess]
  );

  return { submit, submitting, error };
}
