import { cn } from "@/lib/utils";

const controlClasses =
  "w-full border-0 border-b border-hairline bg-transparent px-0 py-2 text-body placeholder:text-smoke focus:border-void focus:outline-none disabled:text-smoke";

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-micro text-smoke mb-1 block font-mono tracking-[0.1em] uppercase"
    >
      {children}
    </label>
  );
}

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(controlClasses, className)} {...props} />;
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn(controlClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(controlClasses, "min-h-24", className)} {...props} />;
}
