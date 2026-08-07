import Link from "next/link";

const policyLinks = [
  { href: "/shipping", label: "SHIPPING" },
  { href: "/returns", label: "RETURNS" },
  { href: "/size-guide", label: "SIZE GUIDE" },
  { href: "/faq", label: "FAQ" },
];

const socialLinks = [
  { href: "https://instagram.com", label: "INSTAGRAM" },
  { href: "https://tiktok.com", label: "TIKTOK" },
  { href: "https://twitter.com", label: "X" },
];

export function Footer() {
  return (
    <footer className="bg-void text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="text-micro text-paper/50 font-mono tracking-[0.12em] uppercase">GOTPAID</p>
          <p className="text-caption text-paper/70 mt-3 max-w-xs">
            Nigerian streetwear, cut in small runs. Pay, get the alert, wear it first.
          </p>
        </div>
        <div>
          <p className="text-micro text-paper/50 font-mono tracking-[0.12em] uppercase">Policies</p>
          <ul className="mt-3 space-y-1.5">
            {policyLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-caption hover:text-paper/60 font-mono">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-micro text-paper/50 font-mono tracking-[0.12em] uppercase">Socials</p>
          <ul className="mt-3 space-y-1.5">
            {socialLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-caption hover:text-paper/60 font-mono"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-paper/10 border-t">
        <p className="text-micro text-paper/40 mx-auto max-w-6xl px-4 py-4 font-mono tracking-[0.12em] uppercase">
          © {new Date().getFullYear()} GOTPAID — PAY, GET THE ALERT.
        </p>
      </div>
    </footer>
  );
}
