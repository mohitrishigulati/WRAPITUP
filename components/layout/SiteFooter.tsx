import Link from "next/link";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { PaymentMethodsBar } from "@/components/layout/PaymentMethodsBar";
import {
  FOOTER_POLICY_LINKS,
  FOOTER_STORE_LINKS,
} from "@/lib/store/store-pages";
import { getWhatsAppNumber, getShippingFreeThresholdDisplay } from "@/lib/store/storefront-config";

export function SiteFooter() {
  const whatsapp = getWhatsAppNumber();
  const freeShip = getShippingFreeThresholdDisplay();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-900 text-zinc-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-white">WrapItUp</p>
          <p className="mt-2 text-sm leading-relaxed">
            Curated return gifts, party favors, and personalization — storefront UX inspired by{" "}
            <span className="text-zinc-400">giftoo.in</span>.
          </p>
          <p className="mt-3 text-xs text-zinc-500">
            Free shipping on orders above ₹{freeShip}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white">Need help?</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Working hours: 10am – 7pm, Mon – Sat</li>
            {whatsapp ? (
              <li>
                WhatsApp:{" "}
                <a
                  href={`https://wa.me/${whatsapp}`}
                  className="text-brand-400 hover:text-brand-300"
                  target="_blank"
                  rel="noreferrer"
                >
                  Chat with us
                </a>
              </li>
            ) : null}
            <li>
              <Link href="/info/contact" className="hover:text-white">
                Contact us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white">Policy</p>
          <ul className="mt-3 space-y-2 text-sm">
            {FOOTER_POLICY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white">Store info</p>
          <ul className="mt-3 space-y-2 text-sm">
            {FOOTER_STORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/products" className="hover:text-white">
                All products
              </Link>
            </li>
            <li>
              <Link href="/themes" className="hover:text-white">
                Shop by theme
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-800 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-white">Newsletter</p>
          <p className="mt-1 text-xs text-zinc-500">
            Events, sales, and new return-gift drops.
          </p>
          <div className="mt-4 max-w-md">
            <NewsletterSignup compact />
          </div>
        </div>
      </div>
      <PaymentMethodsBar />
      <div className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} WrapItUp · Made with care in India
      </div>
    </footer>
  );
}
