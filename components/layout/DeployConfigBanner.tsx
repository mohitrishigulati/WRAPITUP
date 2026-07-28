import Link from "next/link";

/** Shown when DATABASE_URL or AUTH_SECRET is missing on the deployment. */
export function DeployConfigBanner() {
  const missing: string[] = [];
  if (!process.env.DATABASE_URL?.trim()) missing.push("DATABASE_URL");
  if (!process.env.AUTH_SECRET?.trim() && !process.env.NEXTAUTH_SECRET?.trim()) {
    missing.push("AUTH_SECRET");
  }

  if (!missing.length) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
      <strong>Setup required:</strong> Add {missing.join(" and ")} in Vercel → Project → Settings →
      Environment Variables, then redeploy.{" "}
      <Link href="/api/health" className="font-medium underline">
        Check /api/health
      </Link>
    </div>
  );
}
