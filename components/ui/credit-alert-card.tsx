import { cn } from "@/lib/utils";

type Row = { label: string; value: string };

export function CreditAlertCard({
  merchant = "GOTPAID",
  amount,
  rows,
  className,
}: {
  merchant?: string;
  amount: string;
  rows: Row[];
  className?: string;
}) {
  return (
    <div className={cn("perforated border-void bg-paper border", className)}>
      <div className="text-caption space-y-1.5 p-5 font-mono">
        <p className="text-micro text-smoke tracking-[0.14em] uppercase">Credit Alert</p>
        <p className="text-title tracking-display">{merchant}</p>
        <p className="pt-2">
          <span className="text-smoke">AMT: </span>
          <span className="text-void">{amount}</span>
        </p>
        <div className="border-void/40 my-3 border-t border-dashed" />
        <dl className="space-y-1.5">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-6">
              <dt className="text-smoke">{row.label}</dt>
              <dd className="text-right">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
