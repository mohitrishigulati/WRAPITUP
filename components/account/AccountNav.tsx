import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
];

type AccountNavProps = {
  current: "profile" | "orders" | "wishlist";
};

export function AccountNav({ current }: AccountNavProps) {
  return (
    <nav className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4">
      {links.map((link) => {
        const active =
          (current === "profile" && link.href === "/account/profile") ||
          (current === "orders" && link.href === "/account/orders") ||
          (current === "wishlist" && link.href === "/account/wishlist");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              active
                ? "bg-zinc-900 text-white"
                : "text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AccountShell({
  title,
  description,
  nav,
  children,
}: {
  title: string;
  description?: string;
  nav: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-zinc-900">{title}</h1>
        {description ? <p className="mt-1 text-zinc-600">{description}</p> : null}
      </div>
      {nav}
      <div className="mt-8">{children}</div>
    </div>
  );
}
