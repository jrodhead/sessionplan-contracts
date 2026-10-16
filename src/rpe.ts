/**
 * Whether effort was recorded, and its average (SES-320).
 *
 * A shared rule: the API writes average RPE into each log's summary, the AI's
 * planning context and the performance summary, and the app shows set RPE and
 * a log's average. If they disagreed, the log page and the coach would report
 * different effort for the same sets. Pure and import-free (see AGENTS.md,
 * shared rules).
 */

/** The RPE scale's bounds. Anything outside them was not a recorded effort. */
export const RPE_MIN = 1;
export const RPE_MAX = 10;

/**
 * Whether a value is a recorded RPE: a finite number from 1 to 10, half points
 * included. Applies to a set's RPE and to a stored average (a mean of 1-10
 * values is itself 1-10). A stored 0, null, a missing value, or anything else
 * means not recorded.
 */
export function isRecordedRpe(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= RPE_MIN && value <= RPE_MAX;
}

/** The mean of the recorded RPEs among `values`, unrounded; `undefined` when none was recorded. */
export function meanRecordedRpe(values: readonly unknown[]): number | undefined {
  let sum = 0;
  let count = 0;
  for (const value of values) {
    if (isRecordedRpe(value)) {
      sum += value;
      count++;
    }
  }
  return count > 0 ? sum / count : undefined;
}
