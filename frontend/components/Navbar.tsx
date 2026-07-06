"use client";

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  useUser,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Command } from "lucide-react";

export default function Navbar() {
  const { isLoaded, isSignedIn } = useUser();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/70 bg-white/85 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/85">
      <div className="mx-auto flex max-w-5xl h-14 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-cyan-600 text-white">
            <Command className="h-3 w-3" />
          </div>
          <span>Bookmark Brain</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <button
            onClick={() => scrollToSection("features")}
            className="text-xs text-zinc-500 hover:text-cyan-700 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors font-medium cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("process")}
            className="text-xs text-zinc-500 hover:text-cyan-700 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors font-medium cursor-pointer"
          >
            How it Works
          </button>
          <button
            onClick={() => scrollToSection("use-cases")}
            className="text-xs text-zinc-500 hover:text-cyan-700 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors font-medium cursor-pointer"
          >
            Use Cases
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {isLoaded && isSignedIn ? (
            <>
              <Button asChild size="sm" className="rounded-md bg-cyan-600 hover:bg-cyan-700 text-white dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:text-white">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton />
            </>
          ) : isLoaded ? (
            <>
              <SignInButton mode="modal">
                <button className="text-xs font-medium text-zinc-500 hover:text-cyan-700 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="rounded-md bg-cyan-600 hover:bg-cyan-700 text-white dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:text-white">
                  Get Started
                </Button>
              </SignUpButton>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
