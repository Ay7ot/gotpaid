import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { Footer } from "@/components/ui/footer";
import { Nav } from "@/components/ui/nav";
import { getPrimaryDrop } from "@/lib/catalog";
import { CartProvider } from "@/lib/cart";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function StorefrontLayout({ children }: LayoutProps<"/">) {
  const [{ drop, state }, user] = await Promise.all([getPrimaryDrop(), getCurrentUser()]);

  return (
    <CartProvider>
      {drop && state === "live" ? <AnnouncementBar drop={drop} /> : null}
      <Nav signedIn={Boolean(user)} />
      <main className="flex-1">{children}</main>
      <Footer />
    </CartProvider>
  );
}
