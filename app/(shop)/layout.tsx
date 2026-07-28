import { SiteHeader } from "@/components/layout/SiteHeader";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader />
      <main>{children}</main>
    </div>
  );
}
