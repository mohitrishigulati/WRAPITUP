import Link from "next/link";

type ViewAllButtonProps = {
  href: string;
  label?: string;
};

/** Giftoo-style centered pink CTA under homepage grids. */
export function ViewAllButton({ href, label = "View all" }: ViewAllButtonProps) {
  return (
    <div className="mt-8 flex justify-center">
      <Link
        href={href}
        className="inline-flex min-w-[9rem] items-center justify-center rounded-full bg-accent-pink px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#ff5a95]"
      >
        {label}
      </Link>
    </div>
  );
}
