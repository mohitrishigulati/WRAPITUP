import type { Metadata } from "next";
import { Baloo_2, Inter } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { getSiteUrl } from "@/lib/seo/site-url";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const baloo2 = Baloo_2({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "WrapItUp",
    template: "%s | WrapItUp",
  },
  description: "Curated gifts, return favors, and party picks — shop WrapItUp.",
  openGraph: {
    siteName: "WrapItUp",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${baloo2.variable} font-sans antialiased text-neutral-text`}>
        <AuthSessionProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
