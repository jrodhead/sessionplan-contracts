/**
 * How distance, duration and pace are written (SES-311, conditioning-exercise-history).
 *
 * A shared rule: the API writes these strings into exercise history and the AI's
 * planning context, and the app writes durations in the logger and on history
 * pages. If the two disagreed, the same run would read differently on the page
 * and to the coach. Pure and import-free (see AGENTS.md, shared rules).
 */
import type { UnitSystem } from './common.js';

const METERS_PER_MILE = 1609.344;
const METERS_PER_YARD = 0.9144;

/** Round to at most two decimals and drop trailing zeros: 3.10686 → "3.11", 4.0 → "4". */
function twoDecimals(value: number): string {
  return String(Math.round(value * 100) / 100);
}

/**
 * Write a distance given in metres in the person's unit system.
 *
 * Imperial: miles to at most two decimals from 0.1 mi up, whole yards below.
 * Metric: whole metres below 1,000 m, kilometres to at most two decimals from
 * there. A distance greater than zero is never written as zero. Returns '' when
 * nothing was recorded.
 */
export function formatDistance(meters: number | null | undefined, unitSystem: UnitSystem): string {
  if (meters == null || !Number.isFinite(meters) || meters < 0) return '';
  if (unitSystem === 'imperial') {
    const miles = meters / METERS_PER_MILE;
    if (miles >= 0.1) return `${twoDecimals(miles)} mi`;
    const yards = Math.round(meters / METERS_PER_YARD);
    return `${meters > 0 ? Math.max(1, yards) : 0} yd`;
  }
  const wholeMeters = Math.round(meters);
  if (wholeMeters < 1000) return `${meters > 0 ? Math.max(1, wholeMeters) : 0} m`;
  return `${twoDecimals(meters / 1000)} km`;
}

/** h:mm:ss or m:ss for a whole number of seconds. */
function clock(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${ss}`;
  return `${minutes}:${ss}`;
}

/**
 * Write a duration: seconds below a minute ("45s"), m:ss below an hour,
 * h:mm:ss from an hour up. Returns '' when nothing was recorded.
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return '';
  const whole = Math.round(seconds);
  if (whole < 60) return `${whole}s`;
  return clock(whole);
}

/**
 * Read a duration typed as h:mm:ss, m:ss (minutes may exceed 59, as before) or
 * plain seconds with an optional "s"/"sec" suffix. Undefined when unreadable or
 * when a minutes or seconds part that must be under 60 is not.
 */
export function parseDuration(input: string): number | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  const hms = trimmed.match(/^(\d+):(\d{1,2}):(\d{1,2})$/);
  if (hms) {
    const hours = parseInt(hms[1], 10);
    const minutes = parseInt(hms[2], 10);
    const seconds = parseInt(hms[3], 10);
    if (minutes >= 60 || seconds >= 60) return undefined;
    return hours * 3600 + minutes * 60 + seconds;
  }

  const ms = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (ms) {
    const minutes = parseInt(ms[1], 10);
    const seconds = parseInt(ms[2], 10);
    if (seconds >= 60) return undefined;
    return minutes * 60 + seconds;
  }

  const plain = trimmed.match(/^(\d+)\s*(s|sec)?$/i);
  if (plain) return parseInt(plain[1], 10);

  return undefined;
}

/**
 * Write a pace as time per mile (imperial) or per kilometre (metric), rounded to
 * the nearest second, for every kind of exercise. Callers pass only time and
 * distance from sets that recorded both. Returns '' when either is missing.
 */
export function formatPace(
  seconds: number | null | undefined,
  meters: number | null | undefined,
  unitSystem: UnitSystem,
): string {
  if (seconds == null || meters == null || !(seconds > 0) || !(meters > 0)) return '';
  const units = unitSystem === 'imperial' ? meters / METERS_PER_MILE : meters / 1000;
  const perUnit = Math.round(seconds / units);
  return `${clock(perUnit)} /${unitSystem === 'imperial' ? 'mi' : 'km'}`;
}
