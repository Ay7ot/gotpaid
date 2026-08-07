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
    <footer className="border-hairline bg-paper border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="text-micro text-smoke font-mono tracking-[0.1em] uppercase">GOTPAID</p>
          <p className="text-caption text-smoke mt-3 max-w-xs">
            Nigerian streetwear, cut in small runs. Pay, get the alert, wear it first.
          </p>
        </div>
        <div>
          <p className="text-micro text-smoke font-mono tracking-[0.1em] uppercase">POLICIES</p>
          <ul className="mt-3 space-y-1.5">
            {policyLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-caption font-mono hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-micro text-smoke font-mono tracking-[0.1em] uppercase">SOCIALS</p>
          <ul className="mt-3 space-y-1.5">
            {socialLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-caption font-mono hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-hairline border-t">
        <p className="text-micro text-smoke mx-auto max-w-6xl px-4 py-4 font-mono tracking-[0.1em] uppercase">
          © {new Date().getFullYear()} GOTPAID — PAY, GET THE ALERT.
        </p>
      </div>
    </footer>
  );
}
