"use client";

import "./globals.css";

/**
 * Last resort, when even the root layout fails. It replaces the whole page,
 * so it brings its own <html> and keeps to plain markup.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center bg-background px-gutter text-foreground">
        <main className="grid max-w-md gap-4 text-center">
          <h1 className="type-title-lg">Sarai is having a moment</h1>
          <p className="text-muted-foreground">Something went wrong on our side. Please try again in a few seconds.</p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-150 ease-soft hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Try again
            </button>
            {/* A full page load on purpose: the app around this page has failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="inline-flex h-11 items-center rounded-lg border border-input px-5 text-sm font-semibold hover:bg-accent">
              Home page
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
