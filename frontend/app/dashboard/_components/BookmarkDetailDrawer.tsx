"use client";

import { Copy, ExternalLink, Loader2, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Bookmark } from "@/types/bookmark";
import { getDomain, STATUS_BADGE, STATUS_LABEL } from "../_lib/dashboard-utils";

interface BookmarkDetailDrawerProps {
  bookmark: Bookmark | null;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}

const PROCESSING_STEPS = [
  "Queued",
  "Scraping",
  "Summarizing",
  "Generating Tags",
  "Creating Embeddings",
  "Completed",
];

export function BookmarkDetailDrawer({ bookmark, onClose, onDelete }: BookmarkDetailDrawerProps) {
  if (!bookmark) return null;

  const domain = getDomain(bookmark.url);
  const tags = bookmark.tags ?? [];
  const isActive = bookmark.status === "pending" || bookmark.status === "processing";
  const bookmarkUrl = bookmark.url;

  async function copyUrl() {
    await navigator.clipboard.writeText(bookmarkUrl);
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/20"
        aria-label="Close details"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Bookmark Details</p>
            <p className="mt-1 text-sm font-semibold text-zinc-950">{domain}</p>
          </div>
          <Button variant="ghost" size="icon-sm" className="rounded-md" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <Badge className={`rounded-full border px-2 py-0 text-xs ${STATUS_BADGE[bookmark.status]}`}>
            {STATUS_LABEL[bookmark.status]}
          </Badge>

          <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-zinc-950">
            {bookmark.title || domain}
          </h2>
            <p className="mt-2 break-all font-mono text-xs text-zinc-500">{bookmarkUrl}</p>

          <section className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Summary</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-700">
              {bookmark.summary ||
                (bookmark.status === "failed"
                  ? bookmark.error_message || "No summary was generated."
                  : "The AI summary will appear here once processing completes.")}
            </p>
          </section>

          {tags.length > 0 && (
            <section className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Tags</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full bg-cyan-50 text-cyan-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <section className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Domain", value: domain },
              { label: "Created", value: new Date(bookmark.created_at).toLocaleString() },
              { label: "Status", value: STATUS_LABEL[bookmark.status] },
              { label: "Qdrant indexed", value: bookmark.status === "completed" ? "Yes" : "Not yet" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-zinc-200 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{item.label}</p>
                <p className="mt-1 truncate text-sm font-medium text-zinc-800">{item.value}</p>
              </div>
            ))}
          </section>

          {isActive && (
            <section className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-700">Processing Timeline</h3>
              <div className="mt-4 space-y-3">
                {PROCESSING_STEPS.map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        index === 0 || bookmark.status === "processing"
                          ? "bg-blue-600"
                          : "bg-blue-200"
                      }`}
                    />
                    <span className="text-sm text-blue-900">{step}</span>
                    {index === 1 && bookmark.status === "processing" && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-700" />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="flex gap-2 border-t border-zinc-200 px-5 py-4">
          <Button className="rounded-lg bg-zinc-950 text-white hover:bg-zinc-800" onClick={() => window.open(bookmarkUrl, "_blank")}>
            <ExternalLink className="h-4 w-4" />
            Open Original
          </Button>
          <Button variant="outline" className="rounded-lg" onClick={copyUrl}>
            <Copy className="h-4 w-4" />
            Copy URL
          </Button>
          <Button
            variant="outline"
            className="ml-auto rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={async () => {
              await onDelete(bookmark.id);
              onClose();
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </aside>
    </div>
  );
}
