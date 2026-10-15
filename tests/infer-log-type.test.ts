/**
 * inferLogType — the shared log type rule (SES-306, logged-sections-by-display-mode).
 *
 * The case table is the contract: the API's save-time fill, the app's read-time
 * fallback and the app's swap all call this function, so a row changing here is a
 * behaviour change in every service.
 */
import { describe, it, expect } from 'vitest';
import {
  inferLogType,
  LOG_TYPE_INPUTS,
  LOG_TYPES_BY_TRAINING_TYPE,
  TRAINING_TYPES,
  DISTANCE_MODALITIES,
  MODALITIES,
} from '../src/index.js';
import type { DefaultLogType, LogTypeExercise, PrescribedInputs } from '../src/index.js';

interface Case {
  name: string;
  prescribed: PrescribedInputs;
  exercise?: LogTypeExercise | null;
  expected: DefaultLogType;
}

const CASES: Case[] = [
  // Spec scenarios (sessions/logging-scope)
  {
    name: 'carry: strength + carry pattern, weight and time',
    prescribed: { weight: true, time: true },
    exercise: { training_type: 'strength', movement_pattern: 'carry' },
    expected: 'carry',
  },
  {
    name: 'loaded kettlebell swing: conditioning, weight and reps keeps a weight box',
    prescribed: { weight: true, reps: true },
    exercise: { training_type: 'conditioning', modality: null },
    expected: 'strength',
  },
  {
    name: 'Cat-Cow x10: mobility with reps is not hold-only',
    prescribed: { reps: true },
    exercise: { training_type: 'mobility' },
    expected: 'strength',
  },
  {
    name: 'run: conditioning with a distance modality, time only',
    prescribed: { time: true },
    exercise: { training_type: 'conditioning', modality: 'run' },
    expected: 'endurance',
  },
  {
    name: 'custom exercise: hold, no weight or reps',
    prescribed: { hold: true },
    exercise: null,
    expected: 'stretch',
  },

  // Library defaults with nothing prescribed
  { name: 'stretch default', prescribed: {}, exercise: { training_type: 'stretch' }, expected: 'stretch' },
  { name: 'mobility default', prescribed: {}, exercise: { training_type: 'mobility' }, expected: 'mobility' },
  {
    name: 'conditioning default, non-distance modality',
    prescribed: {},
    exercise: { training_type: 'conditioning', modality: 'battle-rope' },
    expected: 'conditioning',
  },
  {
    name: 'conditioning default, distance modality',
    prescribed: {},
    exercise: { training_type: 'conditioning', modality: 'row' },
    expected: 'endurance',
  },
  { name: 'strength default', prescribed: {}, exercise: { training_type: 'strength' }, expected: 'strength' },
  {
    name: 'strength default, isometric tag',
    prescribed: {},
    exercise: { training_type: 'strength', tags: ['Isometric'] },
    expected: 'isometric',
  },
  {
    name: 'strength default, carry pattern',
    prescribed: {},
    exercise: { training_type: 'strength', movement_pattern: 'carry' },
    expected: 'carry',
  },

  // Classified, prescription decides within the allowed set
  {
    name: 'ruck walk: conditioning, weight and distance keeps the weight box',
    prescribed: { weight: true, distance: true },
    exercise: { training_type: 'conditioning', modality: 'walk' },
    expected: 'carry',
  },
  {
    name: 'plank: strength + isometric tag, hold',
    prescribed: { hold: true },
    exercise: { training_type: 'strength', tags: ['isometric'] },
    expected: 'isometric',
  },
  {
    name: 'paused squat: strength + isometric tag, reps and weight stays strength',
    prescribed: { reps: true, weight: true },
    exercise: { training_type: 'strength', tags: ['isometric'] },
    expected: 'strength',
  },
  {
    name: 'topical tags are ignored once classified',
    prescribed: { reps: true, weight: true },
    exercise: { training_type: 'strength', tags: ['mobility', 'stretch'] },
    expected: 'strength',
  },
  {
    name: 'stretch with reps is not hold-only',
    prescribed: { reps: true },
    exercise: { training_type: 'stretch' },
    expected: 'strength',
  },
  {
    name: 'mobility drill for time',
    prescribed: { time: true },
    exercise: { training_type: 'mobility' },
    expected: 'mobility',
  },
  {
    name: 'conditioning reps, unloaded',
    prescribed: { reps: true },
    exercise: { training_type: 'conditioning', modality: 'mixed' },
    expected: 'conditioning',
  },
  {
    name: 'conditioning row with distance',
    prescribed: { distance: true, time: true },
    exercise: { training_type: 'conditioning', modality: 'row' },
    expected: 'endurance',
  },
  {
    name: 'strength with reps and a clock stays strength (allowed set wins; time is not guaranteed)',
    prescribed: { reps: true, time: true },
    exercise: { training_type: 'strength' },
    expected: 'strength',
  },
  {
    name: 'unclassified library entry (null training type) uses the prescription',
    prescribed: { reps: true, weight: true },
    exercise: { training_type: null, tags: ['conditioning'] },
    expected: 'strength',
  },

  // Prescription only (no exact library match)
  { name: 'hold with weight', prescribed: { hold: true, weight: true }, expected: 'isometric' },
  { name: 'time only stays conditioning', prescribed: { time: true }, expected: 'conditioning' },
  { name: 'time and distance', prescribed: { time: true, distance: true }, expected: 'endurance' },
  { name: 'weight and time, no reps, is a carry', prescribed: { weight: true, time: true }, expected: 'carry' },
  { name: 'weight and distance is a carry', prescribed: { weight: true, distance: true }, expected: 'carry' },
  { name: 'reps and weight', prescribed: { reps: true, weight: true }, expected: 'strength' },
  { name: 'reps against a clock', prescribed: { reps: true, time: true }, expected: 'conditioning' },
  { name: 'reps only', prescribed: { reps: true }, expected: 'strength' },
  { name: 'nothing at all', prescribed: {}, expected: 'strength' },
  {
    name: 'unclassified, tag fallback',
    prescribed: {},
    exercise: { tags: ['stretch', 'mobility'] },
    expected: 'stretch',
  },
  {
    name: 'unclassified, weight only skips a tag with no weight box',
    prescribed: { weight: true },
    exercise: { tags: ['stretch', 'carry'] },
    expected: 'carry',
  },
];

describe('inferLogType case table', () => {
  it.each(CASES)('$name', ({ prescribed, exercise, expected }) => {
    expect(inferLogType(prescribed, exercise)).toBe(expected);
  });
});

const FLAGS: (keyof PrescribedInputs)[] = ['reps', 'weight', 'time', 'hold', 'distance'];
const ALL_PRESCRIPTIONS: PrescribedInputs[] = Array.from({ length: 1 << FLAGS.length }, (_, mask) =>
  Object.fromEntries(FLAGS.map((flag, i) => [flag, Boolean(mask & (1 << i))])),
);
const EXERCISES: (LogTypeExercise | null)[] = [
  null,
  { training_type: null, tags: ['isometric'] },
  ...TRAINING_TYPES.flatMap((training_type) => [
    { training_type },
    { training_type, tags: ['isometric'] },
    { training_type, movement_pattern: 'carry' },
    ...MODALITIES.map((modality) => ({ training_type, modality })),
  ]),
];

describe('inferLogType guarantees', () => {
  it('is deterministic: the same input always gives the same output', () => {
    for (const exercise of EXERCISES) {
      for (const prescribed of ALL_PRESCRIPTIONS) {
        const first = inferLogType(prescribed, exercise);
        for (let i = 0; i < 5; i++) expect(inferLogType({ ...prescribed }, exercise && { ...exercise })).toBe(first);
      }
    }
  });

  it('never drops a prescribed load or distance, or puts reps into a hold, when the prescription allows otherwise', () => {
    const holds: DefaultLogType[] = ['stretch', 'mobility', 'isometric'];
    for (const exercise of EXERCISES) {
      for (const p of ALL_PRESCRIPTIONS) {
        const result = inferLogType(p, exercise);
        const inputs = LOG_TYPE_INPUTS[result];
        if (p.weight) expect(inputs, `${JSON.stringify({ p, exercise, result })}`).toContain('weight');
        if (p.distance) expect(inputs, `${JSON.stringify({ p, exercise, result })}`).toContain('distance');
        if (p.reps && !p.hold && !p.time) expect(holds, `${JSON.stringify({ p, exercise, result })}`).not.toContain(result);
      }
    }
  });

  it('stays within the training type unless the allowed set would lose a prescribed input', () => {
    for (const exercise of EXERCISES) {
      const type = exercise?.training_type;
      if (!type || !(TRAINING_TYPES as readonly string[]).includes(type)) continue;
      const allowed = LOG_TYPES_BY_TRAINING_TYPE[type as keyof typeof LOG_TYPES_BY_TRAINING_TYPE];
      for (const p of ALL_PRESCRIPTIONS) {
        const result = inferLogType(p, exercise);
        if (allowed.includes(result)) continue;
        // Escaping is only allowed when every allowed type loses the load, the
        // distance, or puts reps into a hold.
        const loses = (lt: DefaultLogType) =>
          (p.weight && !LOG_TYPE_INPUTS[lt].includes('weight')) ||
          (p.distance && !LOG_TYPE_INPUTS[lt].includes('distance')) ||
          (p.reps && !LOG_TYPE_INPUTS[lt].includes('reps'));
        expect(allowed.every(loses), JSON.stringify({ p, exercise, result })).toBe(true);
      }
    }
  });

  it('tolerates a null inside library tags', () => {
    const exercise = { training_type: 'strength', tags: [null, 'Isometric'] as unknown as string[] };
    expect(inferLogType({ hold: true }, exercise)).toBe('isometric');
  });

  it('every distance modality is a published modality', () => {
    for (const modality of DISTANCE_MODALITIES) expect(MODALITIES).toContain(modality);
  });

  it('LOG_TYPE_INPUTS covers every log type the rule can return', () => {
    for (const exercise of EXERCISES) {
      for (const p of ALL_PRESCRIPTIONS) {
        expect(Object.keys(LOG_TYPE_INPUTS)).toContain(inferLogType(p, exercise));
      }
    }
  });
});
