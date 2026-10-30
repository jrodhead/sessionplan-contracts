/**
 * Session create/update requests and responses.
 */
import type { JsonValue, SessionScope, PaginationParams, PaginationMeta } from './common.js';
import type { LinkedSessionProvenance } from './public-catalogs.js';

export interface SessionListParams extends PaginationParams {
  search?: string;
  from?: string;
  to?: string;
  scheduled_from?: string;
  scheduled_to?: string;
  source?: string;
  location_id?: string;
  team_id?: string;
  scope?: SessionScope;
  /** Only sessions for the caller: ones they own, whatever the scope, plus ones shared with their teams. */
  mine?: boolean;
  sort?: 'created_at' | 'scheduled_for' | 'title';
  order?: 'asc' | 'desc';
  block?: number;
  week?: number;
  type?: string;
  tags?: string;
}

export interface SessionCreateRequest {
  title: string;
  block_number?: number;
  week_number?: number;
  session_type?: string;
  /** SessionPlan JSON. */
  content: JsonValue;
  source?: string;
  location_id?: string;
  scheduled_for?: string;
  team_id?: string;
  scope?: SessionScope;
}

export interface SessionUpdateRequest {
  title?: string;
  block_number?: number;
  week_number?: number;
  session_type?: string;
  content?: JsonValue;
  source?: string;
  location_id?: string;
  scheduled_for?: string;
  team_id?: string;
  scope?: SessionScope;
}

/** Session with scope info for API responses (the single-session payload). */
export interface SessionWithScope {
  id: string;
  user_id: string;
  workspace_id: string;
  title: string;
  block_number: number | null;
  week_number: number | null;
  session_type: string | null;
  content: JsonValue;
  source: string;
  location_id: string | null;
  linked_session_provenance?: LinkedSessionProvenance | null;
  scheduled_for: string | null;
  team_id: string | null;
  scope: SessionScope;
  created_at: string;
  updated_at: string;
}

/** Single-session response (GET). */
export type SessionResponse = SessionWithScope;

/**
 * Create/update response: the session plus mutation-time advisories.
 * `warnings` flags equipment mismatches; the auto-assignment fields are present
 * on create when the API resolves a default location.
 */
export interface SessionMutationResponse extends SessionWithScope {
  warnings?: string[];
  location_auto_assigned?: boolean;
  location_assignment_source?: string | null;
}

/**
 * A session as listed. `is_mine` is true when the caller owns it; public-catalog
 * source sessions are never anyone's own.
 */
export type SessionListItem = SessionWithScope & { is_mine: boolean };

/** List sessions response. */
export interface SessionListResponse {
  sessions: SessionListItem[];
  pagination: PaginationMeta;
}

// ============================================================================
// Breath prescription
//
// Breathing is part of an item's prescription, like load and reps, not a kind of
// exercise: box breathing, a yin pose and a goblet squat may all carry one.
// ============================================================================

/**
 * One breath, in seconds per segment. Zero is legal for any segment: a cycle with
 * no holds is circular breathing. The breath engine takes this as the positional
 * `[inhale, inhaleHold, exhale, exhaleHold]`; named fields are what a person or an
 * AI author writes without getting the order wrong.
 */
export interface BreathCycle {
  inhale: number;
  inhaleHold: number;
  exhale: number;
  exhaleHold: number;
}

/**
 * The breath an item prescribes, at `prescription.breath`. The cycle is breathed
 * throughout, or ramped from it to `to` over the item's length.
 *
 * Length is the item's existing `prescription.timeSeconds`, or `breaths` when it is
 * counted in breaths — a pose held for 12 breaths. An item with both is ill-formed.
 */
export interface BreathPrescription extends BreathCycle {
  /** The cycle a ramp arrives at. Absent or null: the cycle holds steady. */
  to?: BreathCycle | null;
  /** Length as a count of breaths, in place of `timeSeconds`. */
  breaths?: number | null;
}
