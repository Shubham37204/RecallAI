// components/SearchBar.tsx
// Dumb component — owns input value only.
// Emits query string via onSearch. No API calls here.

"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  searching: boolean;
  hasResults: boolean;
}

export function SearchBar({
  onSearch,
  onClear,
  searching,
  hasResults,
}: SearchBarProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim().length < 2) return;
    onSearch(value.trim());
  }

  function handleClear() {
    setValue("");
    onClear();
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search your bookmarks..."
          className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-sm"
          disabled={searching}
          minLength={2}
        />
        <button
          type="submit"
          disabled={searching || value.trim().length < 2}
          className="px-4 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium disabled:opacity-40 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          {searching ? "Searching…" : "Search"}
        </button>
        {hasResults && (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Clear
          </button>
        )}
      </form>
    </div>
  );
}
