/** Storefront copy and links — override via env (confirm WhatsApp + hero with ops before production). */

export type PersonalizationFieldDef = {
  key: string;
  label: string;
  maxLength: number;
};

export function parsePersonalizationFields(value: unknown): PersonalizationFieldDef[] {
  if (!Array.isArray(value)) return [];
  const out: PersonalizationFieldDef[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.key !== "string" || typeof row.label !== "string") continue;
    const maxLength =
      typeof row.maxLength === "number" && row.maxLength > 0 ? row.maxLength : 20;
    out.push({ key: row.key, label: row.label, maxLength });
  }
  return out;
}

export const PRICE_BANDS = [
  { slug: "under-50", label: "Gifts below ₹50", min: 0, max: 50 },
  { slug: "under-100", label: "Gifts below ₹100", min: 0, max: 100 },
  { slug: "100-200", label: "Gifts ₹100 – ₹200", min: 100, max: 200 },
  { slug: "200-350", label: "Gifts ₹200 – ₹350", min: 200, max: 350 },
  { slug: "350-500", label: "Gifts ₹350 – ₹500", min: 350, max: 500 },
  { slug: "above-500", label: "Gifts above ₹500", min: 500, max: null as number | null },
] as const;

export function getShippingFreeThresholdDisplay() {
  const raw = process.env.SHIPPING_FREE_THRESHOLD ?? "500";
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 500;
}

export function getHeroConfig() {
  return {
    imageUrl:
      process.env.NEXT_PUBLIC_HERO_IMAGE_URL?.trim() ||
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1600&q=80",
    href: process.env.NEXT_PUBLIC_HERO_LINK?.trim() || "/products?tags=gift-idea",
    title: process.env.NEXT_PUBLIC_HERO_TITLE?.trim() || "Return gifts kids love 🎉",
    subtitle:
      process.env.NEXT_PUBLIC_HERO_SUBTITLE?.trim() ||
      "Curated party favors, personalization, and bulk-friendly picks.",
  };
}

export const WHATSAPP_INTENTS = [
  {
    id: "product",
    label: "Product & sales enquiry",
    message: "Hi WrapItUp! I have a product / sales question.",
  },
  {
    id: "bulk",
    label: "Bulk / return gifts",
    message: "Hi WrapItUp! I need help with bulk or return-gift orders.",
  },
  {
    id: "shipping",
    label: "Order & shipping support",
    message: "Hi WrapItUp! I need help with my order or shipping.",
  },
  {
    id: "returns",
    label: "Return & refund support",
    message: "Hi WrapItUp! I need return or refund support.",
  },
] as const;

export function getWhatsAppNumber(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ||
    process.env.WHATSAPP_NUMBER?.trim();
  if (!raw) return null;
  return raw.replace(/\D/g, "");
}

export function whatsAppUrl(text: string) {
  const number = getWhatsAppNumber();
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export const GENDER_TAG_SLUGS = ["gender-boys", "gender-girls", "gender-unisex"] as const;
export const AGE_TAG_SLUGS = ["age-0-3", "age-3-6", "age-6-9", "age-9-plus"] as const;
