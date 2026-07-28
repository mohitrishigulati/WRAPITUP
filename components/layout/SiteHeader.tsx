import Link from "next/link";
import { safeAuth } from "@/lib/auth/safe-session";
import { getAllCategoriesForNav } from "@/lib/catalog/categories";
import { logoutAction } from "@/actions/auth";
import { CartButton } from "@/components/cart/CartButton";
import { DeployConfigBanner } from "@/components/layout/DeployConfigBanner";
import { PromoBar } from "@/components/layout/PromoBar";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { listThemesForNav } from "@/lib/catalog/themes";
import { db } from "@/lib/db";
import { AGE_TAG_SLUGS, GENDER_TAG_SLUGS } from "@/lib/store/storefront-config";

async function loadNavTags(slugs: readonly string[]) {
  if (!process.env.DATABASE_URL?.trim()) return [];
  try {
    return await db.tag.findMany({
      where: { slug: { in: [...slugs] } },
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    });
  } catch {
    return [];
  }
}

async function loadNavThemes() {
  if (!process.env.DATABASE_URL?.trim()) return [];
  try {
    return await listThemesForNav();
  } catch {
    return [];
  }
}
async function loadNavCategories() {
  if (!process.env.DATABASE_URL?.trim()) return [];
  try {
    return await getAllCategoriesForNav();
  } catch {
    return [];
  }
}

export async function SiteHeader() {
  const [session, categories, themes, genderTags, ageTags] = await Promise.all([
    safeAuth(),
    loadNavCategories(),
    loadNavThemes(),
    loadNavTags(GENDER_TAG_SLUGS),
    loadNavTags(AGE_TAG_SLUGS),
  ]);

  return (
    <>
      <DeployConfigBanner />
      <PromoBar />
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-6 lg:gap-8">
          <Link
            href="/"
            className="shrink-0 text-xl font-bold tracking-tight text-brand-700"
          >
            WrapItUp
          </Link>
          <MegaMenu
            categories={categories}
            themes={themes}
            genderTags={genderTags}
            ageTags={ageTags}
          />
          <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-700 xl:hidden">
            <Link href="/products?tags=gift-idea" className="hover:text-brand-600">
              Gifts
            </Link>
            <Link href="/products" className="hover:text-brand-600">
              Shop
            </Link>
            <Link href="/corporate-gifts" className="hover:text-brand-600">
              Corporate
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/products"
            className="hidden rounded-full border border-zinc-200 px-3 py-1.5 text-zinc-600 hover:border-brand-300 hover:text-brand-700 sm:inline-flex"
          >
            Search
          </Link>
          {session?.user?.role === "ADMIN" ? (
            <Link href="/admin" className="text-zinc-700 hover:text-zinc-900">
              Admin
            </Link>
          ) : null}
          <CartButton />
          {session?.user ? (
            <Link href="/account/profile" className="text-zinc-700 hover:text-zinc-900">
              Account
            </Link>
          ) : null}
          {session?.user ? (
            <>
              <span className="hidden text-zinc-600 sm:inline">{session.user.email}</span>
              <form action={logoutAction}>
                <button type="submit" className="text-zinc-700 hover:text-zinc-900">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-zinc-700 hover:text-zinc-900">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-brand-600 px-3 py-1.5 font-medium text-white hover:bg-brand-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
    </>
  );
}
