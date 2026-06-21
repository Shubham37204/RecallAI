"use client";
// app/dashboard/page.tsx

import { SignOutButton, useUser } from "@clerk/nextjs";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useSearch } from "@/hooks/useSearch";
import { useCreateBookmark } from "@/hooks/useCreateBookmark";
import type { Bookmark } from "@/types/bookmark";
import {
  Search,
  Plus,
  Command,
  Bookmark as BookmarkIcon,
  Clock,
  Compass,
  Folder,
  Sparkles,
  ExternalLink,
  BookOpen,
  Tag,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  ChevronRight,
  Settings,
  Copy,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDomain(url: string) {
  try { return new URL(url).hostname; } catch { return url; }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const STATUS_DOT: Record<string, string> = {
  pending: "bg-zinc-400",
  processing: "bg-zinc-500 animate-pulse",
  completed: "bg-zinc-800 dark:bg-zinc-300",
  failed: "bg-zinc-400",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  processing: "Processing…",
  completed: "Indexed",
  failed: "Failed",
};

// ── Processing indicator ──────────────────────────────────────────────────────

function ProcessingSteps({ status }: { status: string }) {
  const steps = ["Scraping", "Cleaning", "Summarising", "Tagging", "Embedding"];
  if (status !== "pending" && status !== "processing") return null;
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${i === 0 && status === "processing" ? "bg-zinc-600 dark:bg-zinc-400 animate-pulse" : "bg-zinc-200 dark:bg-zinc-700"}`} />
          <span className={`text-[11px] ${i === 0 && status === "processing" ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400"}`}>{s}</span>
        </div>
      ))}
    </div>
  );
}

// ── Empty States ──────────────────────────────────────────────────────────────

const EXAMPLE_URLS = [
  "https://lilianweng.github.io/posts/2023-06-23-agent/",
  "https://docs.docker.com/compose/",
  "https://fastapi.tiangolo.com/tutorial/",
];

function EmptyLibrary({ onQuickSave }: { onQuickSave: (url: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 gap-4 text-center px-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <BookmarkIcon className="h-5 w-5 text-zinc-400" />
      </div>
      <div>
        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">No bookmarks yet</p>
        <p className="text-[11px] text-zinc-400 mt-0.5 max-w-[200px]">Paste a URL above to save and index your first link.</p>
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Try these:</p>
        {EXAMPLE_URLS.map((url) => (
          <button
            key={url}
            onClick={() => onQuickSave(url)}
            className="text-[10px] px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left truncate"
          >
            {url}
          </button>
        ))}
      </div>
    </div>
  );
}

function NoSearchResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 gap-2 text-center px-6">
      <Search className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No results for "{query}"</p>
      <p className="text-[11px] text-zinc-400">Try different keywords, or index more pages.</p>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
      <Sparkles className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
      <p className="text-xs text-zinc-400">Select a bookmark to see AI analysis</p>
    </div>
  );
}

// ── List item ─────────────────────────────────────────────────────────────────

interface ListItemProps {
  bookmark: Bookmark;
  active: boolean;
  onClick: () => void;
}

function ListItem({ bookmark, active, onClick }: ListItemProps) {
  const domain = getDomain(bookmark.url);
  const tags = bookmark.tags ?? [];

  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-1.5 p-3 border-b border-zinc-100 dark:border-zinc-900 cursor-pointer transition-colors ${
        active ? "bg-zinc-50 dark:bg-zinc-900/60" : "hover:bg-zinc-50/60 dark:hover:bg-zinc-900/20"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium text-zinc-400 truncate">{domain}</span>
        <span className="text-[10px] text-zinc-400 shrink-0">{timeAgo(bookmark.created_at)}</span>
      </div>

      <h4 className="text-xs font-semibold leading-snug text-zinc-800 dark:text-zinc-200 line-clamp-2">
        {bookmark.title ?? domain}
      </h4>

      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOT[bookmark.status] ?? "bg-zinc-300"}`} />
        <span className="text-[10px] text-zinc-400">{STATUS_LABEL[bookmark.status] ?? bookmark.status}</span>
        {tags.length > 0 && (
          <>
            <span className="text-[10px] text-zinc-300 dark:text-zinc-700">·</span>
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((t) => (
                <Badge key={t} variant="secondary" className="h-4 rounded px-1 text-[9px] bg-zinc-100 text-zinc-500 border-none dark:bg-zinc-900 dark:text-zinc-400">
                  {t}
                </Badge>
              ))}
              {tags.length > 2 && (
                <span className="text-[9px] text-zinc-400">+{tags.length - 2}</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ListItemSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-3 border-b border-zinc-100 dark:border-zinc-900">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-4/5" />
      <div className="flex gap-1">
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>
    </div>
  );
}

// ── Detail Pane ───────────────────────────────────────────────────────────────

interface DetailPaneProps {
  bookmark: Bookmark | null;
  onDelete: (id: string) => Promise<void>;
}

function DetailPane({ bookmark, onDelete }: DetailPaneProps) {
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!bookmark) return <EmptyDetail />;

  const domain = getDomain(bookmark.url);
  const tags = bookmark.tags ?? [];

  async function handleDelete() {
    setDeleting(true);
    try { await onDelete(bookmark!.id); } finally { setDeleting(false); }
  }

  function handleCopy() {
    navigator.clipboard.writeText(bookmark!.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Pane header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-900">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">AI Analysis</span>
        <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${
          bookmark.status === "completed"
            ? "text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            : bookmark.status === "failed"
            ? "text-zinc-500 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            : "text-zinc-500 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
        }`}>
          {bookmark.status === "completed"
            ? <><Sparkles className="h-2.5 w-2.5" /> Synced</>
            : bookmark.status === "failed"
            ? <><AlertCircle className="h-2.5 w-2.5" /> Failed</>
            : <><Loader2 className="h-2.5 w-2.5 animate-spin" /> Processing</>
          }
        </span>
      </div>

      {/* Scrollable body */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-4">
          {/* Title + URL */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
                {bookmark.title ?? domain}
              </h3>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-zinc-400 hover:text-zinc-600 transition-colors mt-0.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{domain}</p>
          </div>

          {/* Processing pipeline indicator */}
          <ProcessingSteps status={bookmark.status} />

          {/* Summary */}
          {bookmark.summary && (
            <div className="rounded-lg border border-zinc-100 dark:border-zinc-900 bg-zinc-50/80 dark:bg-zinc-900/40 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                <BookOpen className="h-3.5 w-3.5" />
                Summary
              </div>
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {bookmark.summary}
              </p>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                <Tag className="h-3.5 w-3.5" />
                Tags
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="rounded px-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 bg-transparent"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Source", value: domain },
              { label: "Saved", value: new Date(bookmark.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
              { label: "Content", value: bookmark.content_length ? `${(bookmark.content_length / 1000).toFixed(1)}k chars` : "—" },
              { label: "Status", value: STATUS_LABEL[bookmark.status] ?? bookmark.status },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5 rounded border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-900/20 p-2.5">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">{label}</span>
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate">{value}</span>
              </div>
            ))}
          </div>

          {/* Error message */}
          {bookmark.status === "failed" && bookmark.error_message && (
            <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 p-3">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{bookmark.error_message}</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Action bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-100 dark:border-zinc-900">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-[11px] rounded border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          onClick={() => window.open(bookmark.url, "_blank")}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Open
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px] rounded border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          onClick={handleCopy}
        >
          {copied ? <><X className="h-3 w-3 mr-1" />Copied</> : <><Copy className="h-3 w-3 mr-1" />Copy</>}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px] rounded border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-700"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useUser();
  const [urlInput, setUrlInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeBookmark, setActiveBookmark] = useState<Bookmark | null>(null);
  const [activeSection, setActiveSection] = useState<"all" | "recent">("all");

  const { bookmarks, loading, error: bookmarkError, refresh, remove } = useBookmarks();
  const { results, query, searching, error: searchError, search, clear } = useSearch();
  const { submit, submitting, error: createError } = useCreateBookmark(refresh);

  const isSearchMode = query.length > 0;

  // Stats derived from bookmarks
  const stats = useMemo(() => ({
    total: bookmarks.length,
    indexed: bookmarks.filter((b) => b.status === "completed").length,
    processing: bookmarks.filter((b) => b.status === "pending" || b.status === "processing").length,
  }), [bookmarks]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!urlInput.trim()) return;
    submit(urlInput.trim());
    setUrlInput("");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchInput.trim()) { clear(); return; }
    search(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    clear();
  }

  // Displayed list: search results or bookmarks (filtered by section)
  const displayItems: Bookmark[] = useMemo(() => {
    if (isSearchMode) {
      // Map search results back to full bookmark objects
      return results
        .map((r) => bookmarks.find((b) => b.id === r.bookmark_id))
        .filter(Boolean) as Bookmark[];
    }
    if (activeSection === "recent") {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      return bookmarks.filter((b) => new Date(b.created_at).getTime() >= cutoff);
    }
    return bookmarks;
  }, [isSearchMode, results, bookmarks, activeSection]);

  // Auto-select first item when list changes
  useMemo(() => {
    if (displayItems.length > 0 && (!activeBookmark || !displayItems.find((b) => b.id === activeBookmark.id))) {
      setActiveBookmark(displayItems[0]);
    }
    if (displayItems.length === 0) setActiveBookmark(null);
  }, [displayItems]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-zinc-950 overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="h-12 shrink-0 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 w-[200px]">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950">
            <Command className="h-3 w-3" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Workspace</span>
        </div>

        {/* Centre: Global search / URL bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ask anything in plain English…"
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 pl-8 pr-16 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors"
            />
            {isSearchMode ? (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="absolute right-2 flex items-center gap-0.5 pointer-events-none">
                <kbd className="rounded bg-zinc-200 dark:bg-zinc-800 px-1 text-[9px] text-zinc-500 font-mono">⌘</kbd>
                <kbd className="rounded bg-zinc-200 dark:bg-zinc-800 px-1 text-[9px] text-zinc-500 font-mono">K</kbd>
              </div>
            )}
          </div>
        </form>

        {/* Right: User + sign out */}
        <div className="flex items-center justify-end gap-3 w-[200px]">
          {user?.primaryEmailAddress?.emailAddress && (
            <span className="hidden lg:block text-[11px] text-zinc-400 truncate max-w-[120px]">
              {user.primaryEmailAddress.emailAddress}
            </span>
          )}
          <SignOutButton redirectUrl="/">
            <button className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </header>

      {/* ── Three-column workspace ───────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Col 1: Sidebar (fixed) */}
        <aside className="hidden md:flex w-[200px] shrink-0 flex-col border-r border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-950">
          {/* Add URL form */}
          <form onSubmit={handleSave} className="p-3 border-b border-zinc-100 dark:border-zinc-900">
            <div className="flex gap-1.5">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste a URL…"
                required
                disabled={submitting}
                className="min-w-0 flex-1 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-700"
              />
              <button
                type="submit"
                disabled={submitting || !urlInput.trim()}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40 transition-colors dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              </button>
            </div>
            {createError && <p className="text-[10px] text-red-500 mt-1">{createError}</p>}
          </form>

          {/* Nav */}
          <nav className="flex flex-col gap-4 p-3">
            {/* Library section */}
            <div className="flex flex-col gap-0.5">
              <span className="px-2 text-[9px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Library</span>
              {[
                { id: "all" as const, label: "All Bookmarks", icon: BookmarkIcon, count: stats.total },
                { id: "recent" as const, label: "Recently Saved", icon: Clock, count: null },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveSection(item.id); clearSearch(); }}
                  className={`flex items-center justify-between rounded px-2 py-1.5 text-xs transition-colors text-left w-full ${
                    activeSection === item.id && !isSearchMode
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/50 hover:text-zinc-800 dark:hover:text-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== null && item.count > 0 && (
                    <span className="text-[10px] font-mono opacity-60">{item.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Stats */}
            {stats.total > 0 && (
              <div className="flex flex-col gap-1">
                <span className="px-2 text-[9px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Index Status</span>
                {[
                  { label: "Indexed", value: stats.indexed },
                  { label: "Processing", value: stats.processing },
                  { label: "Failed", value: stats.total - stats.indexed - stats.processing },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-2 py-1">
                    <span className="text-[11px] text-zinc-500">{label}</span>
                    <span className="text-[11px] font-semibold font-mono text-zinc-700 dark:text-zinc-300">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </nav>
        </aside>

        {/* Col 2: Middle list */}
        <div className="flex flex-col border-r border-zinc-100 dark:border-zinc-900 w-full md:w-[280px] lg:w-[320px] shrink-0">
          {/* List header */}
          <div className="flex items-center justify-between h-10 px-3 border-b border-zinc-100 dark:border-zinc-900 shrink-0">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              {isSearchMode ? `Results for "${query}"` : activeSection === "all" ? "All Bookmarks" : "Recently Saved"}
            </span>
            {!isSearchMode && (
              <span className="text-[10px] font-mono text-zinc-400">{displayItems.length}</span>
            )}
          </div>

          {/* Error banners */}
          {(bookmarkError || searchError) && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-900">
              <AlertCircle className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <p className="text-[11px] text-zinc-500">{bookmarkError || searchError}</p>
            </div>
          )}

          {/* Scrollable list */}
          <ScrollArea className="flex-1">
            {loading || searching ? (
              Array.from({ length: 5 }).map((_, i) => <ListItemSkeleton key={i} />)
            ) : displayItems.length === 0 ? (
              isSearchMode
                ? <NoSearchResults query={query} />
                : <EmptyLibrary onQuickSave={(url) => { submit(url); }} />
            ) : (
              displayItems.map((bm) => (
                <ListItem
                  key={bm.id}
                  bookmark={bm}
                  active={activeBookmark?.id === bm.id}
                  onClick={() => setActiveBookmark(bm)}
                />
              ))
            )}
          </ScrollArea>
        </div>

        {/* Col 3: AI Detail pane */}
        <div className="hidden lg:flex flex-1 flex-col min-w-0 bg-zinc-50/20 dark:bg-zinc-900/5">
          <DetailPane
            bookmark={activeBookmark}
            onDelete={async (id) => {
              await remove(id);
              setActiveBookmark(null);
            }}
          />
        </div>

      </div>
    </div>
  );
}
