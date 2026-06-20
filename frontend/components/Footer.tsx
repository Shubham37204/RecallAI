"use client";

import Link from "next/link";
import { Command } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-zinc-100 py-16 dark:bg-zinc-950 dark:border-zinc-900">
      <div className="mx-auto max-w-5xl px-6">
        
        {/* Sitemap Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          
          {/* Brand Col */}
          <div className="col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950">
                <Command className="h-3 w-3" />
              </div>
              <span>Bookmark Brain</span>
            </Link>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
              The next-generation searchable repository for articles, tutorials, papers, and files. Owned and protected by your private index.
            </p>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Product</span>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link href="#features" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Resources</span>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link href="#" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Company</span>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link href="#" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Panel */}
        <div className="mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <span>© {new Date().getFullYear()} Bookmark Brain. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <svg className="h-4 w-4 animate-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>


      </div>
    </footer>
  );
}
