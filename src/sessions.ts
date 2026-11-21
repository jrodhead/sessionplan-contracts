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
  /** The reference drone while this item plays. Absent or null: the drone is as the person set it. */
  drone?: BreathDrone | null;
}

/**
 * One voice of the drone: a pitch, as a ratio to the drone's own pitch (the person's), and a
 * share of one voice's level.
 */
export interface BreathDroneVoice {
  /** Frequency multiple of the drone's pitch, 0.5 to 4: 1 the pitch itself, 1.5 a fifth, 2 an octave. Not semitones. */
  ratio: number;
  /** 0 to 1. Levels are shares: when they add up to more than 1 every voice is scaled down, so the drone is never louder than one voice. */
  level: number;
}

/**
 * The reference drone under a breath item: up to six voices, each sounding as a pair of tones
 * that beat at the hertz spread between them. Everything is optional, and a part an item leaves
 * out stays as the items before it left it; `null` is the same as leaving it out. An item that
 * sets a drone switches it on and pairs it, and every part glides from where it is to this item's
 * setting, starting with the item's breath, over `transitionSeconds`.
 *
 * Voices are matched across items by position: the second voice of one item glides to the second
 * voice of the next. A voice the next item lacks fades out.
 */
export interface BreathDrone {
  /** Hertz between each pair's tones, the beat rate, 0 to 100; held, or ramped to `toSpreadHz` over the item. */
  spreadHz?: number | null;
  /** The hertz spread a ramp arrives at. Needs `spreadHz`. */
  toSpreadHz?: number | null;
  /** The interval between each pair's tones, 1 (none) to 2 (an octave); held or ramped to `toSpreadRatio`. */
  spreadRatio?: number | null;
  /** The ratio spread a ramp arrives at. Needs `spreadRatio`. */
  toSpreadRatio?: number | null;
  /** Stereo position of each pair's lower tone, -1 left to 1 right. */
  lowerPan?: number | null;
  /** Stereo position of each pair's upper tone, -1 left to 1 right. */
  upperPan?: number | null;
  /** One to six voices, at least one with a level above 0. */
  voices?: BreathDroneVoice[] | null;
  /** Seconds the drone takes to glide to this item's setting, 0 to 60. Absent: the player's default (10). */
  transitionSeconds?: number | null;
}
