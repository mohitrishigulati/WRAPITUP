import Link from "next/link";
import { auth } from "@/lib/auth";
import { getAllCategoriesForNav } from "@/lib/catalog/categories";
import { logoutAction } from "@/actions/auth";
import { CartButton } from "@/components/cart/CartButton";

export async function SiteHeader() {
  const [session, categories] = await Promise.all([auth(), getAllCategoriesForNav()]);

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
            WrapItUp
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-zinc-700 md:flex">
            <Link href="/products" className="hover:text-zinc-900">
              All products
            </Link>
            {categories.map((category) => (
              <div key={category.id} className="group relative">
                <Link
                  href={`/categories/${category.slug}`}
                  className="hover:text-zinc-900"
                >
                  {category.name}
                </Link>
                {category.children.length > 0 ? (
                  <div className="absolute left-0 top-full z-20 hidden min-w-[12rem] rounded-lg border border-zinc-200 bg-white py-2 shadow-lg group-hover:block">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/categories/${child.slug}`}
                        className="block px-4 py-2 hover:bg-zinc-50"
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
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-800"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
