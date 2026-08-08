export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[55vh] flex-col items-center justify-center gap-4"
      aria-live="polite"
    >
      <p className="text-micro text-smoke font-mono tracking-[0.28em] uppercase">GOTPAID</p>
      <p className="text-caption flex items-center gap-2 font-mono tracking-[0.16em] uppercase">
        {label}
        <span className="loading-dot" />
      </p>
    </div>
  );
}
