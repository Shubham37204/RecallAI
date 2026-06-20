"use client";

import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Command } from "lucide-react";

export default function Navbar() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl h-14 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950">
            <Command className="h-3 w-3" />
          </div>
          <span>Bookmark Brain</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-6 md:flex">
          <button
            onClick={() => scrollToSection("features")}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors font-medium cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("process")}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors font-medium cursor-pointer"
          >
            How it Works
          </button>
          <button
            onClick={() => scrollToSection("use-cases")}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors font-medium cursor-pointer"
          >
            Use Cases
          </button>
        </nav>

        {/* Clerk Auth Actions */}
        <div className="flex items-center gap-3">
          <SignInButton mode="modal">
            <button className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors cursor-pointer">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm" className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
              Get Started
            </Button>
          </SignUpButton>
        </div>
      </div>
    </header>
  );
}
