const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "long",
  timeZone: "Africa/Lagos",
});

export function formatNaira(amount: number) {
  return nairaFormatter.format(amount);
}

export function formatDate(date: Date | string) {
  return dateFormatter.format(new Date(date));
}
