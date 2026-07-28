import type { ReactNode } from "react";

type BadgeVariant = "new" | "theme" | "sale";

const styles: Record<BadgeVariant, string> = {
  new: "bg-accent-yellow text-neutral-text",
  theme: "bg-accent-pink text-white",
  sale: "bg-accent-yellow text-neutral-text",
};

type BadgeProps = {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
};

export function Badge({ variant, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
