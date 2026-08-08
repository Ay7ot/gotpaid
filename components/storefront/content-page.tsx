import { cn } from "@/lib/utils";

export function ContentPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-micro text-smoke font-mono tracking-[0.2em] uppercase">{eyebrow}</p>
      <h1 className="font-display text-display-sm tracking-display sm:text-display mt-3 leading-[0.95] uppercase">
        {title}
      </h1>
      {intro ? <p className="text-lead text-void mt-5 max-w-xl leading-snug">{intro}</p> : null}
      <div className="mt-12 space-y-12">{children}</div>
    </div>
  );
}

export function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-hairline border-t pt-6">
      <h2 className="text-micro text-smoke font-mono tracking-[0.18em] uppercase">{title}</h2>
      <div className="text-body text-void mt-4 space-y-4 leading-relaxed">{children}</div>
    </section>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-caption w-full border-collapse font-mono">
        <thead>
          <tr className="border-hairline text-micro text-smoke border-b text-left tracking-[0.12em] uppercase">
            {head.map((cell) => (
              <th key={cell} className="py-2 pr-4 font-normal">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-hairline border-b">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={cn("py-2 pr-4", cellIndex > 0 && "text-right")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
