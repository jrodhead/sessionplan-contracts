/**
 * Session create/update requests and responses.
 */
import type { JsonValue, SessionScope, PaginationParams, PaginationMeta } from './common.js';

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

/** List sessions response. */
export interface SessionListResponse {
  sessions: SessionWithScope[];
  pagination: PaginationMeta;
}
