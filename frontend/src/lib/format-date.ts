const formatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatActivityTime(iso: string): string {
  return formatter.format(new Date(iso));
}