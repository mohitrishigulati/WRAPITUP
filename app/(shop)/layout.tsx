import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-bg">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
