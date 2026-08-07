import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "solid" | "outline";

type ButtonProps = {
  variant?: ButtonVariant;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<"button">, "className" | "children">;

const variants: Record<ButtonVariant, string> = {
  solid: "bg-void text-paper hover:bg-void/90",
  outline: "border border-void text-void hover:bg-void hover:text-paper",
};

export function Button({ variant = "solid", href, className, children, ...props }: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center px-6 py-3 font-mono text-caption uppercase tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
    variants[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
