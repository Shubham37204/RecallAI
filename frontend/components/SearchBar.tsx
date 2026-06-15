// components/SearchBar.tsx — dumb, emits query to parent
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  searching: boolean;
  hasResults: boolean;
}

export function SearchBar({ onSearch, onClear, searching, hasResults }: SearchBarProps) {
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search your saved knowledge…"
        disabled={searching}
        minLength={2}
        className="flex-1"
      />
      <Button type="submit" disabled={searching || value.trim().length < 2}>
        {searching ? "Searching…" : "Search"}
      </Button>
      {hasResults && (
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>
      )}
    </form>
  );
}
