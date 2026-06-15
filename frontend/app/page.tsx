// app/page.tsx — public landing page
// Authenticated users are redirected to /dashboard by middleware

import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="border-b border-zinc-100 dark:border-zinc-900">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
            Bookmark Brain
          </span>
          <nav className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="px-3 py-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">
                Get started
              </button>
            </SignUpButton>
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            AI-powered bookmark management
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight mb-6">
            Save links.
            <br />
            <span className="text-zinc-400 dark:text-zinc-500">
              Find knowledge.
            </span>
          </h1>

          <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Bookmark Brain reads every page you save, extracts the key ideas,
            and lets you search your entire collection in plain English — not
            just by title or URL.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <SignUpButton mode="modal">
              <button className="px-5 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">
                Start for free
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                Sign in
              </button>
            </SignInButton>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="border-t border-zinc-100 dark:border-zinc-900">
          <div className="max-w-4xl mx-auto px-6 py-20">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest text-center mb-12">
              How it works
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Paste a link",
                  body: "Drop any URL — article, doc, video, thread. Bookmark Brain handles the rest.",
                },
                {
                  step: "02",
                  title: "AI reads it",
                  body: "Content is scraped, summarised, and tagged automatically. No manual effort.",
                },
                {
                  step: "03",
                  title: "Search in plain English",
                  body: "Ask questions or describe a topic. Semantic search surfaces the right bookmark every time.",
                },
              ].map(({ step, title, body }) => (
                <div key={step} className="flex flex-col gap-3">
                  <span className="text-xs font-mono text-zinc-300 dark:text-zinc-600">
                    {step}
                  </span>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────────── */}
        <section className="border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="max-w-4xl mx-auto px-6 py-20">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest text-center mb-12">
              What you get
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "AI summaries",
                  body: "Every page is condensed into a clear, scannable summary the moment you save it.",
                },
                {
                  title: "Semantic search",
                  body: "Search by meaning, not keywords. Find the article you half-remember without knowing its title.",
                },
                {
                  title: "Auto tagging",
                  body: "Topics are extracted automatically. Browse by tag or let search do the work.",
                },
                {
                  title: "Personal knowledge archive",
                  body: "Everything you've ever saved, instantly retrievable. Your second brain, actually useful.",
                },
              ].map(({ title, body }) => (
                <div
                  key={title}
                  className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-2"
                >
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="border-t border-zinc-100 dark:border-zinc-900">
          <div className="max-w-2xl mx-auto px-6 py-20 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
              Your bookmarks, finally useful.
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
              Get started free. No credit card required.
            </p>
            <SignUpButton mode="modal">
              <button className="px-6 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">
                Create your workspace
              </button>
            </SignUpButton>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-100 dark:border-zinc-900">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <span>© {new Date().getFullYear()} Bookmark Brain</span>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
