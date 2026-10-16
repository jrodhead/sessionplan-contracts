/**
 * Whether effort was recorded, and its average — the shared rule (SES-320).
 *
 * The case tables are the contract: the API's log summaries, the AI's planning
 * context, the performance summary and the app's log page all decide with these.
 */
import { describe, it, expect } from 'vitest';
import { isRecordedRpe, meanRecordedRpe, RPE_MIN, RPE_MAX } from '../src/index.js';

describe('isRecordedRpe', () => {
  const cases: Array<[string, unknown, boolean]> = [
    ['the bottom of the scale', 1, true],
    ['a half point', 7.5, true],
    ['the top of the scale', 10, true],
    ['0, saved by the coach before SES-320', 0, false],
    ['a pre-SES-320 average diluted below 1', 0.67, false],
    ['above the scale', 11, false],
    ['negative', -1, false],
    ['NaN', Number.NaN, false],
    ['Infinity', Number.POSITIVE_INFINITY, false],
    ['null', null, false],
    ['missing', undefined, false],
    ['a string', '8', false],
  ];
  it.each(cases)('%s', (_, value, expected) => {
    expect(isRecordedRpe(value)).toBe(expected);
  });

  it('publishes the scale', () => {
    expect([RPE_MIN, RPE_MAX]).toEqual([1, 10]);
  });
});

describe('meanRecordedRpe', () => {
  const cases: Array<[string, unknown[], number | undefined]> = [
    ['nothing recorded', [undefined, null, 0], undefined],
    ['no values', [], undefined],
    ['some sets recorded: 8, none, 9', [8, undefined, 9], 8.5],
    ['every set recorded', [6, 8], 7],
    ['a saved 0 does not pull the mean down', [0, 8], 8],
    ['unrounded: 7, 7 and 9', [7, 7, 9], 23 / 3],
  ];
  it.each(cases)('%s', (_, values, expected) => {
    expect(meanRecordedRpe(values)).toBe(expected);
  });
});
