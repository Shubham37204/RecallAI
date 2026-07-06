"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EXAMPLES = [
  "articles about autonomous agents",
  "docker deployment guides",
  "memory systems in LLMs",
];

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
  const [focused, setFocused] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim().length < 2) return;
    onSearch(value.trim());
    setFocused(false);
  }

  function handleExample(q: string) {
    setValue(q);
    onSearch(q);
    setFocused(false);
  }

  function handleClear() {
    setValue("");
    onClear();
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Ask your bookmarks…"
          disabled={searching}
          minLength={2}
          className="flex-1 border-zinc-200 dark:border-zinc-700 focus-visible:ring-blue-500"
        />
        <Button
          type="submit"
          disabled={searching || value.trim().length < 2}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {searching ? "Searching…" : "Search"}
        </Button>
        {hasResults && (
          <Button type="button" variant="outline" onClick={handleClear}>
            Clear
          </Button>
        )}
      </form>

      {focused && !value && !hasResults && (
        <div className="flex flex-col gap-1 px-1">
          <p className="text-xs text-zinc-400">Try asking:</p>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleExample(q)}
                className="text-xs px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
