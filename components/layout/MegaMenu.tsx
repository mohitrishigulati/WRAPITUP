import Link from "next/link";
import { PRICE_BANDS } from "@/lib/store/storefront-config";
import { catalogQueryString } from "@/lib/catalog/params";

type NavCategory = {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
};

type NavTheme = { id: string; name: string; slug: string };

type NavTag = { slug: string; name: string };

type MegaMenuProps = {
  categories: NavCategory[];
  themes: NavTheme[];
  genderTags: NavTag[];
  ageTags: NavTag[];
};

function Dropdown({
  label,
  href,
  children,
}: {
  label: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      {href ? (
        <Link href={href} className="hover:text-brand-600">
          {label}
        </Link>
      ) : (
        <span className="cursor-default hover:text-brand-600">{label}</span>
      )}
      <div className="absolute left-0 top-full z-30 hidden min-w-[14rem] rounded-lg border border-zinc-200 bg-white py-2 shadow-lg group-hover:block group-focus-within:block">
        {children}
      </div>
    </div>
  );
}

export function MegaMenu({ categories, themes, genderTags, ageTags }: MegaMenuProps) {
  return (
    <nav className="hidden flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-700 xl:flex">
      <Link href="/" className="font-medium hover:text-brand-600">
        Home
      </Link>
      <Link href="/products?tags=gift-idea" className="hover:text-brand-600">
        Return gifts
      </Link>
      <Link href="/products?tags=new-arrival" className="hover:text-brand-600">
        New arrivals
      </Link>
      <Link href="/products?tags=personalization" className="hover:text-brand-600">
        Personalization
      </Link>
      <Link href="/products?tags=best-seller" className="hover:text-brand-600">
        #Trending
      </Link>

      <Dropdown label="Categories ▾">
        {categories.map((cat) => (
          <div key={cat.id}>
            <Link
              href={`/categories/${cat.slug}`}
              className="block px-4 py-2 font-medium hover:bg-brand-50"
            >
              {cat.name}
            </Link>
            {cat.children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="block px-4 py-1.5 pl-6 text-xs text-zinc-600 hover:bg-brand-50"
              >
                {child.name}
              </Link>
            ))}
          </div>
        ))}
      </Dropdown>

      <Dropdown label="By price ▾">
        {PRICE_BANDS.map((band) => (
          <Link
            key={band.slug}
            href={`/products${catalogQueryString({
              minPrice: band.min,
              maxPrice: band.max ?? undefined,
            })}`}
            className="block px-4 py-2 hover:bg-brand-50"
          >
            {band.label}
          </Link>
        ))}
      </Dropdown>

      <Dropdown label="By theme ▾">
        <Link href="/themes" className="block px-4 py-2 font-medium hover:bg-brand-50">
          All themes
        </Link>
        {themes.map((theme) => (
          <Link
            key={theme.id}
            href={`/themes/${theme.slug}`}
            className="block px-4 py-2 hover:bg-brand-50"
          >
            {theme.name}
          </Link>
        ))}
      </Dropdown>

      <Dropdown label="By gender ▾">
        {genderTags.map((tag) => (
          <Link
            key={tag.slug}
            href={`/products${catalogQueryString({ tags: tag.slug })}`}
            className="block px-4 py-2 hover:bg-brand-50"
          >
            {tag.name}
          </Link>
        ))}
      </Dropdown>

      <Dropdown label="By age ▾">
        {ageTags.map((tag) => (
          <Link
            key={tag.slug}
            href={`/products${catalogQueryString({ tags: tag.slug })}`}
            className="block px-4 py-2 hover:bg-brand-50"
          >
            {tag.name}
          </Link>
        ))}
      </Dropdown>

      <Link href="/products" className="hover:text-brand-600">
        View all
      </Link>
      <Link href="/corporate-gifts" className="font-medium text-brand-700 hover:text-brand-800">
        Corporate gifts
      </Link>
    </nav>
  );
}
