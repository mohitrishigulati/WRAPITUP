import Link from "next/link";
import { GIFTOO_NAV_SHORTCUTS } from "@/lib/store/home-sections";

export function NavShortcutBar() {
  return (
    <nav
      className="hidden border-t border-neutral-border bg-neutral-surface xl:block"
      aria-label="Quick categories"
    >
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 text-xs text-zinc-700 sm:px-6 [scrollbar-width:thin]">
        {GIFTOO_NAV_SHORTCUTS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 hover:bg-brand-50 hover:text-brand-700"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/products"
          className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 font-semibold text-brand-700 hover:bg-brand-50"
        >
          View All
        </Link>
      </div>
    </nav>
  );
}
