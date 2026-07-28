import Link from "next/link";
import { catalogQueryString } from "@/lib/catalog/params";

type PaginationProps = {
  page: number;
  totalPages: number;
  basePath: string;
  query: Record<string, string | number | boolean | undefined | string[]>;
};

export function Pagination({ page, totalPages, basePath, query }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prevQuery = catalogQueryString({ ...query, page: page - 1 });
  const nextQuery = catalogQueryString({ ...query, page: page + 1 });

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-zinc-200 pt-6 text-sm"
    >
      {page > 1 ? (
        <Link
          href={`${basePath}${prevQuery}`}
          className="rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-50"
        >
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-zinc-600">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={`${basePath}${nextQuery}`}
          className="rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-50"
        >
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
