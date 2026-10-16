/**
 * Distance, duration and pace writing — the shared rule (SES-311,
 * conditioning-exercise-history).
 *
 * The case tables are the contract: the API writes exercise history and the AI's
 * planning context with these, and the app's logger and history page do too, so
 * a row changing here changes what every surface shows.
 */
import { describe, it, expect } from 'vitest';
import { formatDistance, formatDuration, parseDuration, formatPace } from '../src/index.js';
import type { UnitSystem } from '../src/index.js';

const MILE = 1609.344;

describe('formatDistance', () => {
  const cases: Array<[string, number | null | undefined, UnitSystem, string]> = [
    ['5,000 m for someone who uses miles', 5000, 'imperial', '3.11 mi'],
    ['4 mi', 4 * MILE, 'imperial', '4 mi'],
    ['16 mi total', 16 * MILE, 'imperial', '16 mi'],
    ['6.11 mi total, summed before rounding', 5000 + 3 * MILE, 'imperial', '6.11 mi'],
    ['0.1 mi is written in miles', 0.1 * MILE, 'imperial', '0.1 mi'],
    ['0.025 mi carry in yards', 0.025 * MILE, 'imperial', '44 yd'],
    ['a tiny distance is never zero (imperial)', 0.2, 'imperial', '1 yd'],
    ['80 m carry', 80, 'metric', '80 m'],
    ['400 m repeat', 400, 'metric', '400 m'],
    ['8 km', 8000, 'metric', '8 km'],
    ['4 km of intervals', 4000, 'metric', '4 km'],
    ['999.6 m rounds into kilometres, not "1000 m"', 999.6, 'metric', '1 km'],
    ['5 km run from miles', 3.10686 * MILE, 'metric', '5 km'],
    ['a tiny distance is never zero (metric)', 0.2, 'metric', '1 m'],
    ['nothing recorded', undefined, 'imperial', ''],
    ['null', null, 'metric', ''],
    ['a recorded zero', 0, 'metric', '0 m'],
  ];
  it.each(cases)('%s', (_name, meters, unitSystem, expected) => {
    expect(formatDistance(meters, unitSystem)).toBe(expected);
  });
});

describe('formatDuration and parseDuration', () => {
  const cases: Array<[number, string]> = [
    [0, '0s'],
    [45, '45s'],
    [59, '59s'],
    [60, '1:00'],
    [125, '2:05'],
    [1888, '31:28'],
    [3599, '59:59'],
    [3600, '1:00:00'],
    [3900, '1:05:00'],
    [7463, '2:04:23'],
  ];
  it.each(cases)('%i seconds is written %s and read back', (seconds, text) => {
    expect(formatDuration(seconds)).toBe(text);
    expect(parseDuration(text)).toBe(seconds);
  });

  it('writes nothing when nothing was recorded', () => {
    expect(formatDuration(undefined)).toBe('');
    expect(formatDuration(null)).toBe('');
  });

  it('rounds a fractional duration to the second', () => {
    expect(formatDuration(1887.6)).toBe('31:28');
  });

  it('keeps reading minutes past 59 as before', () => {
    expect(parseDuration('75:00')).toBe(4500);
  });

  it.each([
    ['45s', 45],
    ['45 sec', 45],
    ['0:45', 45],
    ['2:30', 150],
  ])('reads %s', (text, seconds) => {
    expect(parseDuration(text)).toBe(seconds);
  });

  it.each(['', '   ', 'abc', '2:99', '1:60:00', '1:05:60', '1:2:3:4'])('rejects "%s"', (text) => {
    expect(parseDuration(text)).toBeUndefined();
  });
});

describe('formatPace', () => {
  const cases: Array<[string, number, number, UnitSystem, string]> = [
    ['4 mi in 31:28', 1888, 4 * MILE, 'imperial', '7:52 /mi'],
    ['4 mi in 30:13 rounds to the second', 1813, 4 * MILE, 'imperial', '7:33 /mi'],
    ['8 km in 44:00', 2640, 8000, 'metric', '5:30 /km'],
    ['four timed 800 m sets', 800, 3200, 'metric', '4:10 /km'],
    ['400 m in 1:36', 96, 400, 'metric', '4:00 /km'],
    ['a walk slower than an hour per mile', 3700, MILE, 'imperial', '1:01:40 /mi'],
  ];
  it.each(cases)('%s', (_name, seconds, meters, unitSystem, expected) => {
    expect(formatPace(seconds, meters, unitSystem)).toBe(expected);
  });

  it('writes no pace without both time and distance', () => {
    expect(formatPace(undefined, 4000, 'metric')).toBe('');
    expect(formatPace(1200, undefined, 'metric')).toBe('');
    expect(formatPace(1200, 0, 'metric')).toBe('');
    expect(formatPace(0, 4000, 'metric')).toBe('');
  });
});
