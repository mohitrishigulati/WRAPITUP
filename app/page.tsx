import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Home",
  description: "Curated home goods and gifts from WrapItUp.",
};

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">WrapItUp</h1>
          <p className="mt-2 text-zinc-600">
            Phase 2 catalog is live — browse products, categories, search, and filters.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Browse products
        </Link>
        {session?.user ? (
          <p className="text-sm text-zinc-600">Signed in as {session.user.email}</p>
        ) : (
          <p className="text-sm text-zinc-600">
            <Link href="/login" className="font-medium text-zinc-900 hover:underline">
              Sign in
            </Link>{" "}
            to save your account for checkout later.
          </p>
        )}
      </main>
    </div>
  );
}
