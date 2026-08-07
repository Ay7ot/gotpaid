import { Footer } from "@/components/ui/footer";
import { Nav } from "@/components/ui/nav";

export default function StorefrontLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
