const PHRASES = ["PAY. GET THE ALERT.", "LIMITED RUNS", "NO RESTOCKS", "NIGERIAN STREETWEAR"];

function Row() {
  const text = PHRASES.map((phrase) => (
    <span key={phrase} className="mx-6 inline-block">
      {phrase} <span className="text-alert">✦</span>
    </span>
  ));
  return <span aria-hidden="true">{text}</span>;
}

export function Marquee() {
  return (
    <div className="border-hairline bg-void overflow-hidden border-b py-3">
      <div className="marquee-track text-micro text-paper/70 flex w-max font-mono tracking-[0.2em] whitespace-nowrap uppercase">
        <Row />
        <Row />
      </div>
    </div>
  );
}
