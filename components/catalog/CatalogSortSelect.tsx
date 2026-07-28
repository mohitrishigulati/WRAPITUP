"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Rating" },
  { value: "relevance", label: "Relevance" },
] as const;

type CatalogSortSelectProps = {
  value: string;
  showRelevance?: boolean;
};

export function CatalogSortSelect({ value, showRelevance }: CatalogSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const options = SORT_OPTIONS.filter(
    (opt) => showRelevance || opt.value !== "relevance",
  );

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-700">
      <span className="whitespace-nowrap">Sort by</span>
      <select
        value={value}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("sort", e.target.value);
          params.delete("page");
          router.push(`${pathname}?${params.toString()}`);
        }}
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
