import { Suspense } from "react";
import type { ReactNode } from "react";

export function CatalogToolbarFallback() {
  return (
    <div className="h-10 animate-pulse rounded-lg bg-zinc-100" aria-hidden />
  );
}

export function CatalogToolbarSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<CatalogToolbarFallback />}>{children}</Suspense>;
}
