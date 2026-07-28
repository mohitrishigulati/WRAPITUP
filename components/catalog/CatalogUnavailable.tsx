import Link from "next/link";

type CatalogUnavailableProps = {
  hint?: string | null;
  looksLikeLocalDevUrl?: boolean;
};

export function CatalogUnavailable({ hint, looksLikeLocalDevUrl }: CatalogUnavailableProps) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-6 text-left">
      <h1 className="text-lg font-semibold text-amber-950">Catalog unavailable</h1>
      {looksLikeLocalDevUrl ? (
        <p className="mt-2 text-sm font-medium text-amber-950">
          Production is still using a <strong>local</strong> database URL (localhost or Prisma Dev).
        </p>
      ) : null}
      <p className="mt-2 text-sm text-amber-900">
        On Vercel, <code className="rounded bg-amber-100 px-1">DATABASE_URL</code> must be a{" "}
        <strong>hosted Postgres</strong> URL (Neon, Supabase, Vercel Postgres)—not your laptop.
      </p>
      {hint ? <p className="mt-3 text-sm text-amber-900">{hint}</p> : null}
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-amber-900">
        <li>
          Create free Postgres at{" "}
          <a
            href="https://neon.tech"
            className="font-medium underline"
            target="_blank"
            rel="noreferrer"
          >
            neon.tech
          </a>{" "}
          and copy the connection string (<code className="rounded bg-amber-100 px-1">?sslmode=require</code>
          ).
        </li>
        <li>
          From the project folder run:{" "}
          <code className="block mt-1 rounded bg-amber-100 px-2 py-1 text-xs">
            node scripts/setup-production-catalog.mjs &quot;postgresql://...&quot;
          </code>
          (updates Vercel env, runs <code className="rounded bg-amber-100 px-1">db push</code> +{" "}
          <code className="rounded bg-amber-100 px-1">catalog:seed</code>).
        </li>
        <li>
          Redeploy: <code className="rounded bg-amber-100 px-1">npx vercel deploy --prod</code>
        </li>
      </ol>
      <Link href="/api/health" className="mt-4 inline-block text-sm font-medium underline">
        Check /api/health
      </Link>
    </div>
  );
}
