/**
 * Exercise resolution, search, and detail responses.
 */
import type { JsonValue, ExerciseScope, PaginationParams } from './common.js';
import type { DefaultLogType } from './context.js';

// ============================================================================
// Taxonomy vocabularies
//
// The single published source for exercise classification values. The API's
// database constraints, its validators, the MCP tool enums and the app's filters
// all take their lists from here; a drift test in sessionplan-api compares the
// migration SQL against these arrays.
// ============================================================================

/**
 * What kind of exercise this is — not the section it fills. Warm-up and
 * cool-down are section roles, so they are not training types.
 */
export type TrainingType = 'strength' | 'conditioning' | 'mobility' | 'stretch';

export const TRAINING_TYPES: readonly TrainingType[] = [
  'strength',
  'conditioning',
  'mobility',
  'stretch',
] as const;

/** How a `conditioning` exercise covers ground or does work. Null for every other type. */
export type Modality =
  | 'run'
  | 'walk'
  | 'row'
  | 'bike'
  | 'ski'
  | 'swim'
  | 'elliptical'
  | 'jump-rope'
  | 'battle-rope'
  | 'sled'
  | 'stairs'
  | 'mixed';

export const MODALITIES: readonly Modality[] = [
  'run',
  'walk',
  'row',
  'bike',
  'ski',
  'swim',
  'elliptical',
  'jump-rope',
  'battle-rope',
  'sled',
  'stairs',
  'mixed',
] as const;

/** Required for `strength`, optional for `mobility`, null for `conditioning` and `stretch`. */
export type MovementPattern =
  | 'push'
  | 'pull'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'carry'
  | 'rotation'
  | 'anti-rotation'
  | 'anti-extension'
  | 'anti-lateral-flexion';

export const MOVEMENT_PATTERNS: readonly MovementPattern[] = [
  'push',
  'pull',
  'squat',
  'hinge',
  'lunge',
  'carry',
  'rotation',
  'anti-rotation',
  'anti-extension',
  'anti-lateral-flexion',
] as const;

/**
 * Values for `primary_muscles` and `secondary_muscles`: what a lifter would say they
 * trained. Some are muscles (biceps, lats), some are areas (upper back, neck) — the
 * mix is deliberate. The rule that keeps the data clear: **no value contains
 * another**, so a set is never counted twice. That is why there is no "back",
 * "shoulders" or "core": their parts are listed instead.
 *
 * Boundaries (also in the classification guide and the MCP search description):
 * traps = shrugging (upper traps); upper-back = pulling the shoulder blades back
 * (rhomboids, mid/lower traps — rows, face pulls); abs = trunk flexion and
 * anti-extension; obliques = rotation, anti-rotation, side bending; lower-back =
 * spinal extension; abductors = moving the leg out (glute med/min); tibialis =
 * lifting the toes; feet-ankles = foot muscles and ankle stabilisers only (calf
 * raises stay calves, toe raises stay tibialis).
 */
export type Muscle =
  | 'chest'
  | 'lats'
  | 'upper-back'
  | 'traps'
  | 'neck'
  | 'front-delts'
  | 'side-delts'
  | 'rear-delts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'lower-back'
  | 'glutes'
  | 'abductors'
  | 'adductors'
  | 'hip-flexors'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'tibialis'
  | 'feet-ankles';

export const MUSCLES: readonly Muscle[] = [
  'chest',
  'lats',
  'upper-back',
  'traps',
  'neck',
  'front-delts',
  'side-delts',
  'rear-delts',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'obliques',
  'lower-back',
  'glutes',
  'abductors',
  'adductors',
  'hip-flexors',
  'quads',
  'hamstrings',
  'calves',
  'tibialis',
  'feet-ankles',
] as const;

/** What a person sees for each muscle value. Stored values are never shown raw. */
export const MUSCLE_LABELS: Readonly<Record<Muscle, string>> = {
  chest: 'Chest',
  lats: 'Lats',
  'upper-back': 'Upper back',
  traps: 'Traps',
  neck: 'Neck',
  'front-delts': 'Front delts',
  'side-delts': 'Side delts',
  'rear-delts': 'Rear delts',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms & grip',
  abs: 'Abs',
  obliques: 'Obliques',
  'lower-back': 'Lower back',
  glutes: 'Glutes',
  abductors: 'Abductors (outer hip)',
  adductors: 'Adductors (inner thigh)',
  'hip-flexors': 'Hip flexors',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  calves: 'Calves',
  tibialis: 'Shins (tibialis)',
  'feet-ankles': 'Feet & ankles',
};

/**
 * Body regions for grouping the muscle filter, in display order. A region is a way
 * to filter ("All shoulders"), never a value an exercise is tagged with. Lower back
 * sits under Core so "All back" returns pulling work, not trunk extension.
 */
export const MUSCLE_GROUPS: ReadonlyArray<{ label: string; muscles: readonly Muscle[] }> = [
  { label: 'Chest', muscles: ['chest'] },
  { label: 'Back & neck', muscles: ['lats', 'upper-back', 'traps', 'neck'] },
  { label: 'Shoulders', muscles: ['front-delts', 'side-delts', 'rear-delts'] },
  { label: 'Arms', muscles: ['biceps', 'triceps', 'forearms'] },
  { label: 'Core', muscles: ['abs', 'obliques', 'lower-back'] },
  { label: 'Hips & legs', muscles: ['glutes', 'abductors', 'adductors', 'hip-flexors', 'quads', 'hamstrings'] },
  { label: 'Lower leg', muscles: ['calves', 'tibialis', 'feet-ankles'] },
];

/**
 * Values for `tags`: topical labels no other field carries. The type is `training_type`,
 * muscles and body region come from the muscle fields, equipment from `equipment`, and a
 * goal (hypertrophy, zone 2) belongs in the prescription, so none of those are tags.
 *
 * - Modifiers: how the exercise is performed. `unilateral`, `isometric` and `plyometric`
 *   are read by the app (swap picker, logger).
 * - Style: `yoga`, `yin-yoga`.
 * - Purpose: `activation`, `balance`, `low-impact`, `rehab`, `relaxation`.
 */
export type ExerciseTag =
  | 'compound'
  | 'isolation'
  | 'unilateral'
  | 'isometric'
  | 'eccentric'
  | 'plyometric'
  | 'explosive'
  | 'yoga'
  | 'yin-yoga'
  | 'activation'
  | 'balance'
  | 'low-impact'
  | 'rehab'
  | 'relaxation';

export const EXERCISE_TAGS: readonly ExerciseTag[] = [
  'compound',
  'isolation',
  'unilateral',
  'isometric',
  'eccentric',
  'plyometric',
  'explosive',
  'yoga',
  'yin-yoga',
  'activation',
  'balance',
  'low-impact',
  'rehab',
  'relaxation',
] as const;

export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';

export const EXERCISE_LEVELS: readonly ExerciseLevel[] = [
  'beginner',
  'intermediate',
  'advanced',
] as const;

/**
 * The logger log types each training type allows when a log type is chosen for
 * an exercise whose author did not set one: the API on save, and the app on a
 * swap or when reading an older session (see `inferLogType`). An item's explicit
 * log type always takes precedence, and the prescription wins when nothing
 * allowed can show a prescribed load, rep count or distance.
 */
export const LOG_TYPES_BY_TRAINING_TYPE: Readonly<Record<TrainingType, readonly DefaultLogType[]>> = {
  strength: ['strength', 'isometric', 'carry'],
  conditioning: ['conditioning', 'endurance', 'carry'],
  mobility: ['mobility', 'isometric', 'strength'],
  stretch: ['stretch'],
};

// ============================================================================
// Log type rule
//
// The one rule every service uses to pick a log type the author did not set:
// the API when it saves a session, the app when it reads an older one or swaps
// an exercise. Pure and import-free (see AGENTS.md, shared rules).
// ============================================================================

/** An input box the logger's set row renders. */
export type LoggerInput = 'reps' | 'weight' | 'time' | 'distance';

/**
 * The boxes the logger's set row renders for each log type. `time` is a hold
 * for `isometric`, `mobility` and `stretch`, and a clock for the rest.
 */
export const LOG_TYPE_INPUTS: Readonly<Record<DefaultLogType, readonly LoggerInput[]>> = {
  strength: ['reps', 'weight'],
  isometric: ['weight', 'time'],
  conditioning: ['reps', 'time'],
  endurance: ['time', 'distance'],
  carry: ['weight', 'time', 'distance'],
  mobility: ['time'],
  stretch: ['time'],
};

/** Conditioning modalities that cover ground, so default to `endurance`. */
export const DISTANCE_MODALITIES: readonly Modality[] = [
  'run',
  'walk',
  'row',
  'bike',
  'ski',
  'swim',
  'stairs',
] as const;

/**
 * What was prescribed, as flags. Each service converts its own shape — a session
 * item's prescription, or a library exercise's prescription hints — so this
 * package parses nothing. `hold` is a hold duration; `time` is a clock.
 */
export interface PrescribedInputs {
  reps?: boolean;
  weight?: boolean;
  time?: boolean;
  hold?: boolean;
  distance?: boolean;
}

/** The library classification the rule reads, when the exercise has an exact match. */
export interface LogTypeExercise {
  training_type?: string | null;
  modality?: string | null;
  movement_pattern?: string | null;
  tags?: readonly string[] | null;
}

/** Tags that name a log type, most specific first (unclassified exercises only). */
const LOG_TYPE_TAGS: readonly DefaultLogType[] = [
  'stretch',
  'isometric',
  'mobility',
  'carry',
  'endurance',
  'conditioning',
  'strength',
];

/**
 * Pick the log type for an exercise whose author did not set one.
 *
 * With a classified library exercise, its training type sets the default and the
 * allowed set (`LOG_TYPES_BY_TRAINING_TYPE`); the prescription then decides
 * within that set, so a prescribed load, rep count or distance always has a box.
 * When nothing the training type allows can show the prescribed load or distance,
 * or would put a rep count into a hold, the prescription wins. Without a
 * classification (no match, or a null training type) the prescription decides,
 * with tags as the tie-break. Nothing prescribed and nothing known: `strength`.
 */
export function inferLogType(
  prescribed: PrescribedInputs,
  exercise?: LogTypeExercise | null,
): DefaultLogType {
  const tags = lowerTags(exercise?.tags);
  const type = exercise?.training_type;
  if (!isTrainingType(type)) return fromPrescription(tags, prescribed);

  const libraryDefault = libraryLogType(type, exercise ?? {}, tags.has('isometric'));
  if (!anyPrescribed(prescribed)) return libraryDefault;

  // Topical tags are ignored once classified; `isometric` survives as the one tag
  // that states how an exercise is performed.
  const tieBreak = new Set<string>([libraryDefault, type]);
  if (tags.has('isometric')) tieBreak.add('isometric');
  const candidate = fromPrescription(tieBreak, prescribed);
  const needed = neededInputs(prescribed);
  const clamped = clampToTrainingType(candidate, type, needed);
  if (!losesPrescribed(clamped, needed)) return clamped;
  // Nothing the training type allows keeps the prescription: it wins.
  if (!losesPrescribed(candidate, needed)) return candidate;
  return fromPrescription(new Set(), prescribed);
}

function isTrainingType(value: unknown): value is TrainingType {
  return typeof value === 'string' && (TRAINING_TYPES as readonly string[]).includes(value);
}

function lowerTags(tags: readonly (string | null)[] | null | undefined): Set<string> {
  // Library data, not user input, but a stray null must not fail a save.
  return new Set(
    (tags ?? []).filter((tag): tag is string => typeof tag === 'string').map((tag) => tag.toLowerCase()),
  );
}

function anyPrescribed(p: PrescribedInputs): boolean {
  return Boolean(p.reps || p.weight || p.time || p.hold || p.distance);
}

/** The log type a classified exercise gets when nothing was prescribed. */
function libraryLogType(
  type: TrainingType,
  exercise: LogTypeExercise,
  isometric: boolean,
): DefaultLogType {
  switch (type) {
    case 'stretch':
      return 'stretch';
    case 'mobility':
      return 'mobility';
    case 'conditioning':
      return (DISTANCE_MODALITIES as readonly string[]).includes(exercise.modality ?? '')
        ? 'endurance'
        : 'conditioning';
    case 'strength':
      if (exercise.movement_pattern === 'carry') return 'carry';
      return isometric ? 'isometric' : 'strength';
  }
}

function neededInputs(p: PrescribedInputs): Set<LoggerInput> {
  const needed = new Set<LoggerInput>();
  if (p.reps) needed.add('reps');
  if (p.weight) needed.add('weight');
  if (p.time || p.hold) needed.add('time');
  if (p.distance) needed.add('distance');
  return needed;
}

function shows(logType: DefaultLogType, input: LoggerInput): boolean {
  return LOG_TYPE_INPUTS[logType].includes(input);
}

/** A prescribed load, rep count or distance with no box to record it. */
function losesPrescribed(logType: DefaultLogType, needed: ReadonlySet<LoggerInput>): boolean {
  return (['weight', 'reps', 'distance'] as const).some(
    (input) => needed.has(input) && !shows(logType, input),
  );
}

/**
 * Keep the log type within those the training type allows, choosing one that
 * shows every prescribed input where one exists.
 */
function clampToTrainingType(
  candidate: DefaultLogType,
  type: TrainingType,
  needed: ReadonlySet<LoggerInput>,
): DefaultLogType {
  const allowed = LOG_TYPES_BY_TRAINING_TYPE[type];
  const covers = (lt: DefaultLogType) => [...needed].every((input) => shows(lt, input));

  if (allowed.includes(candidate) && covers(candidate)) return candidate;
  const full = allowed.find(covers);
  if (full) return full;

  // Nothing allowed shows every prescribed input. Keep the candidate if allowed
  // and it keeps the load, distance and reps; otherwise prefer one that does,
  // then whichever shows most.
  if (allowed.includes(candidate) && !losesPrescribed(candidate, needed)) return candidate;
  const shown = (lt: DefaultLogType) => [...needed].filter((input) => shows(lt, input)).length;
  const loses = (lt: DefaultLogType) => (losesPrescribed(lt, needed) ? 1 : 0);
  const ranked = [...allowed].sort((a, b) => loses(a) - loses(b) || shown(b) - shown(a));
  return ranked[0];
}

/** The prescription-first derivation, with `tags` as the tie-break. */
function fromPrescription(tags: ReadonlySet<string>, p: PrescribedInputs): DefaultLogType {
  // Covering ground: loaded is a carry, unloaded is endurance.
  if (p.distance) return p.weight ? 'carry' : 'endurance';

  // A duration plus a hold tag is a hold, even alongside a rep count — the
  // library writes these as `reps: "3-4 holds", time: "10-20s per hold"`.
  if (p.time || p.hold) {
    if (tags.has('isometric')) return 'isometric';
    if (tags.has('stretch')) return 'stretch';
    if (tags.has('mobility')) return 'mobility';
  }

  // Reps are reps; unloaded reps against a clock, or a conditioning movement,
  // want `conditioning`, which shows both.
  if (p.reps) return !p.weight && (p.time || tags.has('conditioning')) ? 'conditioning' : 'strength';

  if (p.hold) return p.weight ? 'isometric' : 'stretch';

  if (p.time) {
    if (p.weight || tags.has('carry')) return 'carry';
    if (tags.has('endurance')) return 'endurance';
    return 'conditioning';
  }

  // Nothing but a load, or nothing at all: a tag that keeps the load, else strength.
  for (const candidate of LOG_TYPE_TAGS) {
    if (tags.has(candidate) && (!p.weight || shows(candidate, 'weight'))) return candidate;
  }
  return 'strength';
}

/** Classification fields shared by create, update and read shapes. */
export interface ExerciseTaxonomyFields {
  training_type?: TrainingType;
  modality?: Modality | null;
  primary_muscles?: Muscle[];
  secondary_muscles?: Muscle[];
  movement_pattern?: MovementPattern | null;
  level?: ExerciseLevel;
}

// ============================================================================
// Exercise Resolution
// ============================================================================

/** Confidence level of exercise name resolution. */
export type ResolveConfidence = 'exact' | 'alias' | 'fuzzy' | 'unresolved';

/** Single resolution result. */
export interface ExerciseResolution {
  /** The name the AI provided. */
  inputName: string;
  /** Canonical slug (always populated — computed via slugify even if unresolved). */
  slug: string;
  /** Whether the exercise exists in the database. */
  found: boolean;
  /** How the match was made. */
  confidence: ResolveConfidence;
  /** Canonical display name (from DB if found, from input if not). */
  canonicalName: string;
  /** Link path (only if found in DB). */
  link: string | null;
  /** Suggested alternative if fuzzy matched to a different exercise. */
  suggestion?: string;
}

/** Batch resolution request. */
export interface ResolveExercisesRequest {
  names: string[];
  workspace_id: string;
}

/** Batch resolution response. */
export interface ResolveExercisesResponse {
  resolutions: ExerciseResolution[];
  stats: {
    total: number;
    exact: number;
    alias: number;
    fuzzy: number;
    unresolved: number;
  };
}

// ============================================================================
// Exercise CRUD / Detail
// ============================================================================

export interface ExerciseListParams extends PaginationParams {
  tag?: string;
  equipment?: string;
  search?: string;
  scope?: ExerciseScope;
  training_type?: TrainingType;
  modality?: Modality;
}

/**
 * Platform administrators only. The request names its target — `scope: 'system'`,
 * or `scope: 'workspace'` with `workspace_id` — and is refused otherwise.
 * `training_type` is required by the API; it is optional here only so the
 * additive release does not break existing type users.
 */
export interface ExerciseCreateRequest extends ExerciseTaxonomyFields {
  scope?: ExerciseScope;
  workspace_id?: string;
  slug: string;
  name: string;
  equipment?: string[];
  tags?: string[];
  setup?: string[];
  steps?: string[];
  cues?: string[];
  mistakes?: string[];
  safety?: string;
  scaling?: {
    regressions?: string[];
    progressions?: string[];
  };
  variations?: string[];
  prescription_hints?: Record<string, unknown>;
  joints?: Record<string, unknown>;
  media?: Record<string, unknown>;
}

export interface ExerciseUpdateRequest extends ExerciseTaxonomyFields {
  name?: string;
  equipment?: string[];
  tags?: string[];
  setup?: string[];
  steps?: string[];
  cues?: string[];
  mistakes?: string[];
  safety?: string;
  scaling?: {
    regressions?: string[];
    progressions?: string[];
  };
  variations?: string[];
  prescription_hints?: Record<string, unknown>;
  joints?: Record<string, unknown>;
  media?: Record<string, unknown>;
}

/** Exercise with scope info for API responses. */
export interface ExerciseWithScope {
  id: string;
  slug: string;
  name: string;
  equipment: string[];
  tags: string[];
  setup: string[];
  steps: string[];
  cues: string[];
  mistakes: string[];
  safety: string | null;
  scaling: JsonValue | null;
  variations: string[];
  prescription_hints: JsonValue | null;
  joints: JsonValue | null;
  media: JsonValue | null;
  /**
   * Classification columns. Optional in this shape so the release stays additive;
   * the API returns them on every row. `training_type` is null only while the
   * library is being classified (exercise-taxonomy-by-training-type).
   */
  training_type?: TrainingType | null;
  modality?: Modality | null;
  primary_muscles?: string[] | null;
  secondary_muscles?: string[] | null;
  movement_pattern?: string | null;
  level?: string | null;
  scope: ExerciseScope;
  workspace_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  /**
   * Non-blocking warning on create: the new exercise closely matches one that
   * already exists. The create still succeeded — confirm with the user rather than
   * treating this as an error, since legitimately distinct exercises (a machine and
   * a free-weight version of one movement) match by design.
   */
  possible_duplicate?: PossibleDuplicate;
}

/** A near-match found at create time. Advisory only. */
export interface PossibleDuplicate {
  /** Slug of the existing exercise that matched. */
  matchedSlug: string;
  /** Which rule matched: exact slug, normalized name, or fuzzy slug distance. */
  reason: string;
}
