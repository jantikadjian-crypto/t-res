import { MOCK_TODAY, type Tone } from "@/lib/mockData";

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtc(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(toUtc(iso));
}

/** Whole days from mock today until `iso`. Negative when in the past. */
/** Time on a task: 35 → "35 min", 110 → "1h 50m". */
export function minutesLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function daysUntil(iso: string, today: string = MOCK_TODAY): number {
  return Math.round((toUtc(iso) - toUtc(today)) / DAY_MS);
}

/** Urgency tone for a deadline: 3 days or less is red, two weeks or less is amber. */
export function deadlineTone(iso: string): Tone {
  const days = daysUntil(iso);
  if (days <= 3) return "bad";
  if (days <= 14) return "warn";
  return "neutral";
}

/** "12 days left", "Due today", "3 days overdue". */
export function daysRemainingLabel(iso: string): string {
  const days = daysUntil(iso);
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  if (days > 1) return `${days} days left`;
  return days === -1 ? "1 day overdue" : `${-days} days overdue`;
}

/** "today", "yesterday", "2 days ago". */
export function daysAgoLabel(iso: string): string {
  const days = -daysUntil(iso);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

/** "5 yrs 8 mos" for a span of days. */
export function durationLabel(days: number): string {
  const months = Math.max(0, Math.round(days / 30.44));
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} ${years === 1 ? "yr" : "yrs"}`);
  if (rest || !years) parts.push(`${rest} ${rest === 1 ? "mo" : "mos"}`);
  return parts.join(" ");
}

export function formatFileSize(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}
