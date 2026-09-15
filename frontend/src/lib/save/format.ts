/** One place that turns save numbers into display strings. */
import { HOURS_PER_DAY, MINUTES_PER_HOUR, SECONDS_PER_HOUR, SECONDS_PER_MINUTE } from "../constants.ts";

const DECIMAL_FORMAT = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const PERCENT_FORMAT = new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 });

export function formatCount(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return DECIMAL_FORMAT.format(value);
}

export function formatRatio(part: number, total: number): string {
  if (total <= 0) return "—";
  return PERCENT_FORMAT.format(part / total);
}

/** The save counts survival in whole minutes. */
export function formatMinutes(minutes: number | undefined): string {
  if (minutes === undefined || !Number.isFinite(minutes) || minutes <= 0) return "0m";
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const rest = Math.round(minutes % MINUTES_PER_HOUR);
  if (hours === 0) return `${rest}m`;
  return `${DECIMAL_FORMAT.format(hours)}h ${rest}m`;
}

/** `LifetimeSurvived` counts seconds. */
export function formatSeconds(seconds: number | undefined): string {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds <= 0) return "0m";
  const days = Math.floor(seconds / (SECONDS_PER_HOUR * HOURS_PER_DAY));
  const hours = Math.floor((seconds % (SECONDS_PER_HOUR * HOURS_PER_DAY)) / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  if (days > 0) return `${DECIMAL_FORMAT.format(days)}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
