# Giftoo.in parity map (WrapItUp)

Reference: [giftoo.in](https://www.giftoo.in/) · sitemap export in project uploads.

This doc tracks **UX/section parity**, not copying Giftoo’s product catalog or assets.

## Homepage sections (giftoo order → WrapItUp)

| Giftoo section | WrapItUp implementation |
|----------------|-------------------------|
| Return Gifts 🎉 | Collection `return-gifts` |
| Shop by Video | Products with `videoUrl` |
| New Arrivals 🎉 | Collection `new-arrivals` |
| MINI FANS | Category carousel `mini-fans` |
| Shop By Category (tile grid) | `HOME_SHOP_TILES` in `lib/store/home-sections.ts` |
| Kids Gadgets | Category `kids-gadgets` |
| Trending on Reel | Collection `trending` (title override) |
| DIY Products + tagline | Category `diy-craft-kits` + subtitle |
| Personalised Gift Sets | Collection `personalization-picks` |
| Shop By Theme | `ThemeGrid` |
| Bottle & Sippers | Category `water-bottles-sippers` |
| LED Lamps | Category `led-lamps` |
| Educational Toys | Category `educational-toys` |
| Keychain | Category `keychains-luggage-tags` |
| Lunch Box | Category `lunch-boxes` |
| School Bags | Category `school-bags` |
| Trust strip (free ship / returns / WhatsApp) | `TrustStrip` |
| Let customers speak for us | `ReviewsStrip` (needs DB reviews) |
| Footer + newsletter + payment labels | `SiteFooter` + `PaymentMethodsBar` |

Configured in **`HOME_SECTIONS`** — reorder or add carousels without code changes.

## Navigation

| Giftoo | WrapItUp |
|--------|----------|
| Top shortcuts (LED Lamps, Lunch Box, …) | `NavShortcutBar` + `GIFTOO_NAV_SHORTCUTS` |
| Return gifts / New arrivals / Trending | Mega-menu links + collections |
| Fancy Stationery mega-tree | Clean hierarchy under **Categories ▾** (see taxonomy doc) |
| By price / theme / gender / age | Mega-menu dropdowns |
| Corporate gifts | `/corporate-gifts` |
| View all | `/products` |

## Pages

| Giftoo | WrapItUp route |
|--------|------------------|
| Collection / category listing | `/collections/[slug]`, `/categories/[slug]`, `/themes/[slug]` |
| Product detail | `/products/[slug]` |
| Cart / checkout | `/cart`, `/checkout` |
| Corporate | `/corporate-gifts` |
| Terms, Privacy, Shipping, Refunds | `/info/terms`, `/info/privacy`, `/info/shipping`, `/info/returns` |
| About, Contact, Track order, Offers | `/info/about`, `/info/contact`, `/info/track-order`, `/info/offers` |
| Blog, mobile app | Not implemented (add when content exists) |

## Not yet at Giftoo scale

- **Catalog size** — Full Giftoo is 1000+ SKUs; this repo seeds **205 products** from `data/www.giftoo.in-0.md` (expand export or supplier CSV + `catalog:build-products`).
- **Search modal** — popular searches / trending products (link `/products?q=` for now).
- **Social footer icons** — add when brand URLs are configured.
- **Live reviews volume** — Giftoo shows 1650+; WrapItUp shows reviews only from real `DELIVERED` orders in DB.
- **DB on production** — homepage sections need seeded hosted Postgres (see `docs/PRODUCTION-DATABASE.md`).

## After schema / config changes

```powershell
npm run catalog:seed
npm run dev
```
