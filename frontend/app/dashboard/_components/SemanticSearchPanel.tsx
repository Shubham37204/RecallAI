"use client";

import { FormEvent, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEARCH_EXAMPLES } from "../_lib/dashboard-utils";

interface SemanticSearchPanelProps {
  query: string;
  searching: boolean;
  error: string | null;
  onSearch: (query: string) => Promise<void>;
  onClear: () => void;
}

export function SemanticSearchPanel({
  query,
  searching,
  error,
  onSearch,
  onClear,
}: SemanticSearchPanelProps) {
  const [input, setInput] = useState("");

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      onClear();
      return;
    }
    await onSearch(trimmed);
  }

  function clearSearch() {
    setInput("");
    onClear();
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950">Semantic Search</h2>
          <p className="mt-1 text-sm text-zinc-500">Ask across everything you have saved.</p>
        </div>
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3">
          <Search className="h-4 w-4 text-cyan-700" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask your bookmarks..."
            disabled={searching}
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
          />
        </div>
        <Button
          type="submit"
          disabled={searching || !input.trim()}
          className="h-11 rounded-lg bg-zinc-950 px-5 text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SEARCH_EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setInput(example);
              onSearch(example);
            }}
            className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
          >
            {example}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}
    </section>
  );
}
