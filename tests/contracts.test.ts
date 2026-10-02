/**
 * Tests for @sessionplan/contracts
 *
 * Verifies the runtime export (ContractVersion) and that the index re-exports
 * the expected type-level shapes. Type-only exports can't be asserted at
 * runtime, but we can confirm the module loads cleanly and that the version
 * constant is consistent with what consumers will see.
 */
import { describe, it, expect } from 'vitest';
import {
  ContractVersion,
  TRAINING_TYPES,
  MODALITIES,
  MOVEMENT_PATTERNS,
  MUSCLES,
  MUSCLE_LABELS,
  MUSCLE_GROUPS,
  EXERCISE_LEVELS,
  LOG_TYPES_BY_TRAINING_TYPE,
} from '../src/index.js';
import type { SameWeekSession } from '../src/index.js';
import packageJson from '../package.json';

// A same-week session written before exercise-taxonomy-by-training-type — no
// `conditioning`, no `completion` — must still satisfy the type, so the release
// stays additive for sessionplan-ai and older pins. Checked by `tsc` over this
// file (vitest strips types without checking them).
const legacySameWeekSession: SameWeekSession = {
  sessionId: 's1',
  title: 'Push',
  scheduledFor: '2026-09-28',
  exercises: ['Goblet Squat'],
  exerciseSets: { 'Goblet Squat': 4 },
};

describe('exercise taxonomy vocabularies', () => {
  it('TRAINING_TYPES is exactly the four types, with no section roles', () => {
    expect([...TRAINING_TYPES]).toEqual(['strength', 'conditioning', 'mobility', 'stretch']);
  });

  it('MODALITIES is exactly the conditioning modality set', () => {
    expect([...MODALITIES]).toEqual([
      'run', 'walk', 'row', 'bike', 'ski', 'swim', 'elliptical',
      'jump-rope', 'battle-rope', 'sled', 'stairs', 'mixed',
    ]);
  });

  it('MOVEMENT_PATTERNS matches the ten patterns of the existing database constraint', () => {
    expect([...MOVEMENT_PATTERNS]).toEqual([
      'push', 'pull', 'squat', 'hinge', 'lunge', 'carry',
      'rotation', 'anti-rotation', 'anti-extension', 'anti-lateral-flexion',
    ]);
  });

  it('MUSCLES is exactly the 23-value vocabulary, with no umbrella values', () => {
    expect([...MUSCLES]).toEqual([
      'chest', 'lats', 'upper-back', 'traps', 'neck',
      'front-delts', 'side-delts', 'rear-delts',
      'biceps', 'triceps', 'forearms',
      'abs', 'obliques', 'lower-back',
      'glutes', 'abductors', 'adductors', 'hip-flexors', 'quads', 'hamstrings',
      'calves', 'tibialis', 'feet-ankles',
    ]);
    // No value contains another: the old parents of these parts are gone.
    for (const umbrella of ['back', 'shoulders', 'core']) {
      expect(MUSCLES as readonly string[]).not.toContain(umbrella);
    }
  });

  it('every muscle has a label, and only the confusable ones carry a hint', () => {
    expect(Object.keys(MUSCLE_LABELS).sort()).toEqual([...MUSCLES].sort());
    expect(MUSCLE_LABELS.tibialis).toBe('Shins (tibialis)');
    expect(MUSCLE_LABELS.abductors).toBe('Abductors (outer hip)');
    expect(MUSCLE_LABELS.adductors).toBe('Adductors (inner thigh)');
  });

  it('MUSCLE_GROUPS places every muscle in exactly one region', () => {
    const grouped = MUSCLE_GROUPS.flatMap((g) => [...g.muscles]);
    expect(grouped.sort()).toEqual([...MUSCLES].sort());
    expect(new Set(grouped).size).toBe(grouped.length);
    expect(MUSCLE_GROUPS.map((g) => g.label)).toEqual([
      'Chest', 'Back & neck', 'Shoulders', 'Arms', 'Core', 'Hips & legs', 'Lower leg',
    ]);
  });

  it('EXERCISE_LEVELS is exactly the three levels', () => {
    expect([...EXERCISE_LEVELS]).toEqual(['beginner', 'intermediate', 'advanced']);
  });

  it('LOG_TYPES_BY_TRAINING_TYPE allows the log types the taxonomy spec lists', () => {
    expect(LOG_TYPES_BY_TRAINING_TYPE).toEqual({
      strength: ['strength', 'isometric', 'carry'],
      conditioning: ['conditioning', 'endurance', 'carry'],
      mobility: ['mobility', 'isometric', 'strength'],
      stretch: ['stretch'],
    });
  });

  it('every training type has an entry, and no vocabulary repeats a value', () => {
    expect(Object.keys(LOG_TYPES_BY_TRAINING_TYPE).sort()).toEqual([...TRAINING_TYPES].sort());
    for (const list of [TRAINING_TYPES, MODALITIES, MOVEMENT_PATTERNS, MUSCLES, EXERCISE_LEVELS]) {
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it('a same-week session without conditioning or completion is still valid', () => {
    expect(legacySameWeekSession.conditioning).toBeUndefined();
    expect(legacySameWeekSession.completion).toBeUndefined();
  });
});

describe('@sessionplan/contracts', () => {
  it('ContractVersion matches package.json version', () => {
    expect(ContractVersion).toBe(packageJson.version);
  });

  it('ContractVersion is a semver-shaped string', () => {
    expect(ContractVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
