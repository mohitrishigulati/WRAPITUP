/** Static storefront pages (Giftoo-style footer / policy links). */

export type StoreInfoPage = {
  slug: string;
  title: string;
  description: string;
  sections: { heading?: string; paragraphs: string[] }[];
};

export const STORE_INFO_PAGES: Record<string, StoreInfoPage> = {
  about: {
    slug: "about",
    title: "About Us",
    description: "About WrapItUp — curated return gifts and party picks.",
    sections: [
      {
        paragraphs: [
          "WrapItUp is a curated gift store inspired by the best online return-gift shops in India. We focus on party favors, personalization, and bulk-friendly picks for birthdays and celebrations.",
        ],
      },
    ],
  },
  contact: {
    slug: "contact",
    title: "Contact Us",
    description: "Get in touch with WrapItUp.",
    sections: [
      {
        paragraphs: [
          "Working hours: 10am – 7pm, Mon to Sat.",
          "For product, bulk, or order help, use the WhatsApp button on any page or email support from your order confirmation.",
        ],
      },
    ],
  },
  shipping: {
    slug: "shipping",
    title: "Shipping Policy",
    description: "Shipping and delivery information.",
    sections: [
      {
        heading: "Free shipping",
        paragraphs: [
          "Orders above the free-shipping threshold (shown in the site banner) qualify for free delivery within India, subject to serviceable pin codes.",
        ],
      },
      {
        heading: "Processing time",
        paragraphs: [
          "Most orders ship within 1–3 business days. Personalized items may need extra processing time.",
        ],
      },
    ],
  },
  returns: {
    slug: "returns",
    title: "Cancellation & Refund",
    description: "Returns and refunds policy.",
    sections: [
      {
        heading: "Returns",
        paragraphs: [
          "Unused items in original packaging may be eligible for return within the window stated at checkout. Personalized products are non-returnable unless defective.",
        ],
      },
      {
        heading: "Refunds",
        paragraphs: [
          "Approved refunds are processed to the original payment method within 5–10 business days.",
        ],
      },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    description: "How WrapItUp handles your data.",
    sections: [
      {
        paragraphs: [
          "We collect account, order, and checkout information needed to fulfill purchases. Payment data is handled by our payment provider; we do not store full card numbers.",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    description: "Terms of use for WrapItUp.",
    sections: [
      {
        paragraphs: [
          "By using this site you agree to our policies and accurate product descriptions. Prices and availability may change without notice.",
        ],
      },
    ],
  },
  "track-order": {
    slug: "track-order",
    title: "Track Your Order",
    description: "Track WrapItUp orders.",
    sections: [
      {
        paragraphs: [
          "Sign in and open My account → Orders to see status and tracking when available. Guest checkout users receive updates by email.",
        ],
      },
    ],
  },
  offers: {
    slug: "offers",
    title: "Offers",
    description: "Current WrapItUp offers.",
    sections: [
      {
        paragraphs: [
          "Use coupon WELCOME10 for 10% off eligible orders when active. Watch the homepage and newsletter for seasonal return-gift deals.",
        ],
      },
    ],
  },
};

export const FOOTER_POLICY_LINKS = [
  { label: "Terms & Conditions", href: "/info/terms" },
  { label: "Privacy Policy", href: "/info/privacy" },
  { label: "Shipping Policy", href: "/info/shipping" },
  { label: "Cancellation & Refund", href: "/info/returns" },
] as const;

export const FOOTER_STORE_LINKS = [
  { label: "About Us", href: "/info/about" },
  { label: "Offers", href: "/info/offers" },
  { label: "Track Your Order", href: "/info/track-order" },
  { label: "Contact us", href: "/info/contact" },
  { label: "Corporate gifts", href: "/corporate-gifts" },
] as const;
