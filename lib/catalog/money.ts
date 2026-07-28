import type { Decimal } from "@prisma/client/runtime/library";

export function decimalToNumber(value: Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return Number(value.toString());
}

const storeCurrency =
  process.env.NEXT_PUBLIC_STORE_CURRENCY?.trim().toUpperCase() || "INR";

export function formatUsd(amount: number) {
  return formatMoney(amount);
}

export function formatMoney(amount: number) {
  const currency = storeCurrency === "USD" ? "USD" : "INR";
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "INR" ? 0 : 2,
  }).format(amount);
}
