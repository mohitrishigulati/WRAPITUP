import Link from "next/link";
import { safeAuth } from "@/lib/auth/safe-session";
import { getAllCategoriesForNav } from "@/lib/catalog/categories";
import { logoutAction } from "@/actions/auth";
import { CartButton } from "@/components/cart/CartButton";
import { DeployConfigBanner } from "@/components/layout/DeployConfigBanner";
import { PromoBar } from "@/components/layout/PromoBar";

async function loadNavCategories() {
  if (!process.env.DATABASE_URL?.trim()) return [];
  try {
    return await getAllCategoriesForNav();
  } catch {
    return [];
  }
}

export async function SiteHeader() {
  const [session, categories] = await Promise.all([safeAuth(), loadNavCategories()]);

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
          <nav className="hidden max-w-3xl flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-700 lg:flex">
            <Link href="/" className="font-medium hover:text-brand-600">
              Home
            </Link>
            <Link href="/products?tags=gift-idea" className="hover:text-brand-600">
              Return gifts
            </Link>
            <Link href="/products?tags=new-arrival" className="hover:text-brand-600">
              New arrivals
            </Link>
            <Link href="/products?tags=best-seller" className="hover:text-brand-600">
              #Trending
            </Link>
            <Link href="/products" className="hover:text-brand-600">
              View all
            </Link>
            {categories.slice(0, 4).map((category) => (
              <div key={category.id} className="group relative">
                <Link
                  href={`/categories/${category.slug}`}
                  className="hover:text-brand-600"
                >
                  {category.name}
                </Link>
                {category.children.length > 0 ? (
                  <div className="absolute left-0 top-full z-20 hidden min-w-[12rem] rounded-lg border border-zinc-200 bg-white py-2 shadow-lg group-hover:block">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/categories/${child.slug}`}
                        className="block px-4 py-2 hover:bg-brand-50"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
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
