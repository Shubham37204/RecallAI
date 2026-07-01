"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { Command } from "lucide-react";

export function DashboardTopNav() {
  const { user } = useUser();
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.primaryEmailAddress?.emailAddress || "User";
  const initial = (displayName[0] ?? "?").toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 text-white shadow-sm">
            <Command className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-950">Bookmark Brain</p>
            <p className="text-[11px] text-zinc-500">AI knowledge workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-xs font-semibold text-white">
              {initial}
            </div>
            <span className="max-w-48 truncate text-sm font-medium text-zinc-700">
              {displayName}
            </span>
          </div>
          <SignOutButton redirectUrl="/">
            <button className="rounded-md px-3 py-2 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>
    </header>
  );
}
