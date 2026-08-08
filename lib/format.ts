const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "long",
  timeZone: "Africa/Lagos",
});

export function formatNaira(kobo: number) {
  return nairaFormatter.format(kobo / 100);
}

export function formatDate(date: Date | string) {
  return dateFormatter.format(new Date(date));
}

export function isInFuture(date: Date | string) {
  return new Date(date).getTime() > Date.now();
}
