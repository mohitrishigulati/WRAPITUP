import Link from "next/link";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/coupons", label: "Coupons" },
];

export function AdminNav() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/admin" className="text-lg font-semibold text-zinc-900">
            Admin
          </Link>
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900">
          ← Storefront
        </Link>
      </div>
    </header>
  );
}
