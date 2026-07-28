import { getShippingFreeThresholdDisplay, getWhatsAppNumber } from "@/lib/store/storefront-config";

const ITEMS = [
  {
    title: "Free shipping",
    body: `Get free shipping on orders above ₹${getShippingFreeThresholdDisplay()}`,
    icon: "🚚",
  },
  {
    title: "3 days return / refund",
    body: "Partial / full return & refund policy",
    icon: "↩️",
  },
  {
    title: "Customer support",
    body: getWhatsAppNumber()
      ? "24×7 WhatsApp chat support available"
      : "Email support for orders & shipping",
    icon: "💬",
  },
];

export function TrustStrip() {
  return (
    <section className="bg-neutral-text py-6 text-white">
      <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-3 sm:gap-4 sm:px-6">
        {ITEMS.map((item) => (
          <li key={item.title} className="flex items-center gap-4 text-center sm:text-left">
            <span className="mx-auto text-2xl sm:mx-0" aria-hidden>
              {item.icon}
            </span>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wide">{item.title}</p>
              <p className="mt-0.5 text-xs text-white/80">{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
