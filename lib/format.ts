import { MOCK_TODAY } from "@/lib/mockData";

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
export function daysUntil(iso: string, today: string = MOCK_TODAY): number {
  return Math.round((toUtc(iso) - toUtc(today)) / DAY_MS);
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
