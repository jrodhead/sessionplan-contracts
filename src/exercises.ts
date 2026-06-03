/**
 * Exercise resolution, search, and detail responses.
 */
import type { JsonValue, ExerciseScope, PaginationParams } from './common.js';

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
}

export interface ExerciseCreateRequest {
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

export interface ExerciseUpdateRequest {
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
  scope: ExerciseScope;
  workspace_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
