import Link from "next/link";
import { Wordmark } from "@/components/ui/wordmark";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-paper flex min-h-full flex-col">
      <header className="border-hairline border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" aria-label="GOTPAID back office">
            <Wordmark className="text-body" />
          </Link>
          <span className="text-micro text-smoke font-mono tracking-[0.12em] uppercase">
            Back office
          </span>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
