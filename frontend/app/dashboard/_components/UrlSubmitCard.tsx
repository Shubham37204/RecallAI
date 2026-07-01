"use client";

import { FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXAMPLE_URLS, isHttpUrl, normalizeUrlInput } from "../_lib/dashboard-utils";

interface UrlSubmitCardProps {
  submitting: boolean;
  submitError: string | null;
  onSubmit: (url: string) => Promise<boolean>;
}

export function UrlSubmitCard({ submitting, submitError, onSubmit }: UrlSubmitCardProps) {
  const [urlInput, setUrlInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [queuedUrl, setQueuedUrl] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const normalizedUrl = normalizeUrlInput(urlInput);
    setValidationError(null);
    setQueuedUrl(null);

    if (!normalizedUrl) {
      setValidationError("Paste a URL before saving.");
      return;
    }
    if (!isHttpUrl(normalizedUrl)) {
      setValidationError("Enter a valid http or https URL.");
      return;
    }

    const saved = await onSubmit(normalizedUrl);
    if (!saved) return;

    setQueuedUrl(normalizedUrl);
    setUrlInput("");
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
              Save a URL
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Paste any article, documentation, YouTube transcript, GitHub repository, or blog URL.
            Bookmark Brain will index it into your searchable AI knowledge base.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5">
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-2 sm:flex-row">
          <input
            value={urlInput}
            onChange={(event) => {
              setUrlInput(event.target.value);
              setValidationError(null);
              setQueuedUrl(null);
            }}
            inputMode="url"
            placeholder="Paste any article, documentation, YouTube transcript, GitHub repository, or blog URL..."
            disabled={submitting}
            className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
          />
          <Button
            type="submit"
            disabled={submitting || !urlInput.trim()}
            className="h-12 rounded-lg bg-cyan-600 px-5 text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLE_URLS.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => {
              setUrlInput(url);
              setValidationError(null);
              setQueuedUrl(null);
            }}
            className="max-w-full truncate rounded-full border border-zinc-200 bg-white px-3 py-1.5 font-mono text-[11px] text-zinc-500 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
          >
            {url}
          </button>
        ))}
      </div>

      {(validationError || submitError) && (
        <div className="mt-4 flex gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{validationError || submitError}</span>
        </div>
      )}

      {queuedUrl && (
        <div className="mt-4 flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="min-w-0">
            Queued for indexing: <span className="font-mono">{queuedUrl}</span>
          </span>
        </div>
      )}
    </section>
  );
}
