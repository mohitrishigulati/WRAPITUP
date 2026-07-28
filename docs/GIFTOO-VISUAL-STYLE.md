# Giftoo-inspired visual style (WrapItUp rebrand)

Styling-only spec — warm kids-gifting aesthetic, orange CTA, pastel accents.

## Tokens

Defined in `tailwind.config.ts`: `brand`, `accent`, `sale`, `neutral`.

## Typography

- **Display:** Baloo 2 (`font-display`) — section titles, logo, trust strip headings  
- **Body:** Inter (`font-sans`) — nav, prices, product copy  

Loaded via `next/font/google` in `app/layout.tsx`.

## Components

- `components/ui/Badge.tsx` — `new` (yellow), `theme` (pink), `sale` (yellow)  
- `ProductCard` — Giftoo card layout: square media, hover second image, `h3` title, Giftoo rating line, sale + strikethrough MRP (`formatStorePrice`, `₹ 399`)  
- `VideoProductCard` — trending badge + **Add to cart** (Shop by Video)  
- `ProductCardPrice`, `ProductCardMedia`, `ProductQuickAdd` — shared card building blocks  
- `CollectionCarousel` — `font-display` section headers with emoji in title string  

## Page background

`bg-neutral-bg` (`#FFFCF9`) on home and shop layouts.

Refine hex values after side-by-side comparison with [giftoo.in](https://www.giftoo.in/).
