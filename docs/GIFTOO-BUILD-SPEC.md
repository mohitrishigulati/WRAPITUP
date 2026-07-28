# Giftoo-style build spec (addendum)

This document maps [giftoo.in](https://www.giftoo.in/) UX and catalog patterns onto WrapItUp’s Next.js stack. It extends **Phase 2 (Catalog)**, adds a **Homepage** phase, and extends **Phase 5 (Admin)**.

See the full spec in your project notes / chat export. Implemented in code:

| Area | Status |
|------|--------|
| Prisma: `Theme`, `ProductTheme`, `Collection`, `CollectionProduct`, `NewsletterSubscriber`, product gifting fields | Done |
| Hardcoded price bands (`lib/store/storefront-config.ts`) | Done |
| Mega-menu (categories, price, theme, gender/age tags) | Done |
| Collection pages `/collections/[slug]`, themes `/themes`, `/corporate-gifts` | Done |
| Homepage: hero (env), collection carousels, shop-by-video, category/theme grids, reviews strip, newsletter, WhatsApp widget | Done |
| Personalization → cart → `OrderItem.personalization` JSON | Done |
| Admin: themes / collections / newsletter CRUD | Partial — use Prisma Studio or follow-up admin UI |

### Env (confirm before production)

- `SHIPPING_FREE_THRESHOLD` — free shipping display (default `500`)
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — WhatsApp widget + corporate page
- `NEXT_PUBLIC_HERO_*` — hero banner image, link, title, subtitle

### After schema change

```powershell
npx prisma db push
npm run catalog:seed
```

Price bands are **hardcoded** (not admin-editable), per spec default.
