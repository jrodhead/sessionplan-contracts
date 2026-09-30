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

/** Values for `primary_muscles` and `secondary_muscles`. */
export type Muscle =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'front-delts'
  | 'rear-delts'
  | 'traps'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'adductors'
  | 'calves'
  | 'core'
  | 'abs'
  | 'obliques'
  | 'lower-back'
  | 'hip-flexors';

export const MUSCLES: readonly Muscle[] = [
  'chest',
  'back',
  'shoulders',
  'front-delts',
  'rear-delts',
  'traps',
  'biceps',
  'triceps',
  'forearms',
  'quads',
  'hamstrings',
  'glutes',
  'adductors',
  'calves',
  'core',
  'abs',
  'obliques',
  'lower-back',
  'hip-flexors',
] as const;

export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';

export const EXERCISE_LEVELS: readonly ExerciseLevel[] = [
  'beginner',
  'intermediate',
  'advanced',
] as const;

/**
 * The logger log types each training type allows when the app chooses one (a
 * swap). An item's explicit log type always takes precedence.
 */
export const LOG_TYPES_BY_TRAINING_TYPE: Readonly<Record<TrainingType, readonly DefaultLogType[]>> = {
  strength: ['strength', 'isometric', 'carry'],
  conditioning: ['conditioning', 'endurance', 'carry'],
  mobility: ['mobility', 'isometric', 'strength'],
  stretch: ['stretch'],
};

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
