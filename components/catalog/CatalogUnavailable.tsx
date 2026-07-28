import Link from "next/link";

export function CatalogUnavailable() {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
      <h1 className="text-lg font-semibold text-amber-950">Catalog unavailable</h1>
      <p className="mt-2 text-sm text-amber-900">
        The app cannot reach the database. On Vercel,{" "}
        <code className="rounded bg-amber-100 px-1">DATABASE_URL</code> must be a{" "}
        <strong>hosted Postgres</strong> URL (Neon, Supabase, Vercel Postgres)—not{" "}
        <code className="rounded bg-amber-100 px-1">localhost</code> or a local Prisma Dev URL.
      </p>
      <p className="mt-3 text-sm text-amber-900">
        After updating env vars, run{" "}
        <code className="rounded bg-amber-100 px-1">npx prisma db push</code> against that database,
        then redeploy.
      </p>
      <Link href="/api/health" className="mt-4 inline-block text-sm font-medium underline">
        Check /api/health
      </Link>
    </div>
  );
}
