/**
 * Shared primitives used across the SessionPlan contract modules.
 *
 * This package is standalone: it does not import from the API codebase. The
 * `JsonValue` alias below mirrors the Supabase `Json` type used server-side so
 * that JSONB payload fields stay structurally compatible without a dependency.
 */

/** Recursive JSON value — mirrors the server-side Supabase `Json` type. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue | undefined }
  | JsonValue[];

// ============================================================================
// Units
// ============================================================================

export type UnitSystem = 'metric' | 'imperial';
export type WeightUnit = 'lb' | 'kg';
export type DistanceUnit = 'mi' | 'km';
export type HeightUnit = 'ft' | 'cm';

// ============================================================================
// Role & Scope Enums
// ============================================================================

export type WorkspaceRole = 'admin' | 'member';
export type TeamRole = 'facilitator' | 'participant';

export type SessionScope = 'private' | 'workspace' | 'team';
export type ExerciseScope = 'system' | 'workspace';
export type LocationScope = 'system' | 'workspace' | 'private';

// ============================================================================
// Pagination
// ============================================================================

export interface PaginationParams {
  /** 1-indexed, default 1 */
  page?: number;
  /** default 20, max 100 */
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
