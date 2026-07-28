const METHODS = [
  "Visa",
  "Mastercard",
  "RuPay",
  "UPI",
  "Net Banking",
  "Paytm",
  "Google Pay",
  "Amazon Pay",
] as const;

export function PaymentMethodsBar() {
  return (
    <div className="border-t border-zinc-800 bg-zinc-950 py-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 px-4 sm:px-6">
        <span className="text-xs text-zinc-500">Payment methods</span>
        <ul className="flex flex-wrap justify-center gap-2">
          {METHODS.map((label) => (
            <li
              key={label}
              className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400"
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
