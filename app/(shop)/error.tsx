"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ShopError({
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
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-lg font-semibold text-zinc-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-zinc-600">
        This page hit a server error. If the catalog is empty, connect a hosted database and run{" "}
        <code className="rounded bg-zinc-100 px-1">npm run catalog:seed</code>.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-zinc-400">Digest: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Try again
        </button>
        <Link href="/" className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium">
          Home
        </Link>
        <Link href="/api/health" className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium">
          Health check
        </Link>
      </div>
    </div>
  );
}
