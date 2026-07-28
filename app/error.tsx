"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-neutral-bg font-sans antialiased text-neutral-text">
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="text-lg font-semibold">Application error</h1>
          <p className="mt-2 text-sm text-neutral-muted">
            A server error occurred. Check{" "}
            <Link href="/api/health" className="text-brand-600 underline">
              /api/health
            </Link>{" "}
            and production <code className="rounded bg-zinc-100 px-1">DATABASE_URL</code>.
          </p>
          {error.digest ? <p className="mt-2 text-xs text-zinc-400">Digest: {error.digest}</p> : null}
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
