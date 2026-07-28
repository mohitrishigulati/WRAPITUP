# WrapItUp — Category Taxonomy (Giftoo-inspired, cleaned up)

## What was messy about Giftoo's structure

On their live nav, items like "Water Bottle & Sipper" appear in multiple menu groups, "Stickers & Washi Tapes" sits under both Stationery and Art & Craft, and bags/handbags overlap without a clear boundary. Fine for a large Shopify store; not something to replicate structurally.

## WrapItUp — single hierarchy

**Top nav (shortcuts, not categories):** Return Gifts · New Arrivals · Personalization · Trending · Corporate Gifts · View All

**Categories (mutually exclusive, one leaf per product):**

### Stationery & School
- Stationery Kits · Pens & Pencils · Erasers & Sharpeners · Notebooks & Diaries · Files & Folders · Highlighters & Markers · Geometry Tools & Rulers · Sticky Notes & Glue Sticks

### Bags & Accessories
- Handbags & Tote Bags · Sling & Waist Bags · Pouches & Pencil Cases · School Bags · Keychains & Luggage Tags

### Toys & Games
- Fun Toys & Games · Educational Toys · Puzzles & Brain Teasers · DIY & Craft Kits

### Art & Craft
- Art Books · Coloring Supplies · Painting Supplies · Stickers & Washi Tapes

### Gadgets & Lighting
- Kids Gadgets · Mini Fans · LED Lamps

### Drinkware & Lunch
- Water Bottles & Sippers · Lunch Boxes

### Gift Sets & Hampers
- Birthday Gift Hampers · Personalized Gift Sets · Corporate Gift Sets

### Party & Decor
- Paper Bags & Gift Boxes · Miniatures · Plushies & Soft Toys

**Cross-cutting filters (not categories):**

- **By price:** bands in `lib/store/storefront-config.ts` (`PRICE_BANDS`)
- **By theme:** Unicorn, Dino, Space, Mermaid, Jungle, Panda, Dessert
- **By gender / age:** tags (`gender-boys`, `gender-girls`, `gender-unisex`, `age-0-3`, `age-3-6`, `age-6-9`, `age-9-plus`)

Themes handle cross-cutting merchandising (e.g. a unicorn pencil pouch stays in **Pouches & Pencil Cases** plus theme **Unicorn** — never two categories).

## Seed

Run:

```bash
npm run catalog:seed
# or
npx tsx prisma/seed.catalog.ts
```

24 sample products use [placehold.co](https://placehold.co) images until real photos are ready.
