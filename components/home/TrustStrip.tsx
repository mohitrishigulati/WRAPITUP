import { getShippingFreeThresholdDisplay } from "@/lib/store/storefront-config";

const ITEMS = [
  {
    title: "Free shipping",
    body: `On orders above ₹${getShippingFreeThresholdDisplay()}`,
    icon: "🚚",
  },
  {
    title: "Easy returns",
    body: "Hassle-free refund policy",
    icon: "↩️",
  },
  {
    title: "Customer support",
    body: "We're here to help",
    icon: "💬",
  },
];

export function TrustStrip() {
  return (
    <section className="border-y border-zinc-200 bg-white py-8">
      <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-3 sm:px-6">
        {ITEMS.map((item) => (
          <li key={item.title} className="flex items-start gap-4 text-center sm:text-left">
            <span className="mx-auto text-2xl sm:mx-0" aria-hidden>
              {item.icon}
            </span>
            <div>
              <p className="font-semibold text-zinc-900">{item.title}</p>
              <p className="mt-0.5 text-sm text-zinc-600">{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
