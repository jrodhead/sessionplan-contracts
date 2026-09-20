/**
 * Workspace list/detail responses and related team types.
 */
import type { WorkspaceRole, TeamRole } from './common.js';

// ============================================================================
// Workspace
// ============================================================================

/**
 * Safety postures a workspace may select for its coaching agent.
 *
 * A closed vocabulary, deliberately. The selected value becomes authoritative to the
 * model — server instructions tell it that a workspace's instruction field is policy —
 * so accepting authored text here would make workspace configuration a channel for
 * supplying arbitrary instruction. That matters once workspaces are customer-created,
 * and more so where one workspace is shared across many members. The workspace picks;
 * the server renders the text.
 */
export type WorkspaceSafetyProfile = 'strength' | 'breath';

export const WORKSPACE_SAFETY_PROFILES: readonly WorkspaceSafetyProfile[] = [
  'strength',
  'breath',
] as const;

/**
 * Known workspace settings keys; additional keys allowed for extensibility.
 */
export interface WorkspaceSettings {
  autoJoinNewUsers?: boolean;
  autoJoinRole?: 'member' | 'admin';
  /**
   * The workspace's agent safety posture. Absent means the default posture: a
   * workspace that has never been configured must behave exactly as it did before
   * this field existed, never erroring and never yielding an empty instruction.
   */
  safetyProfile?: WorkspaceSafetyProfile;
  [key: string]: unknown;
}

export interface Workspace {
  id: string;
  slug: string;
  display_name: string;
  owner_id: string;
  settings: WorkspaceSettings;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  profile?: {
    display_name: string | null;
    email: string | null;
  };
}

export interface WorkspaceCreateRequest {
  slug: string;
  display_name: string;
  settings?: WorkspaceSettings;
}

export interface WorkspaceUpdateRequest {
  display_name?: string;
  settings?: WorkspaceSettings;
}

export interface WorkspaceListItem extends Workspace {
  user_role: WorkspaceRole;
  member_count: number;
}

export interface WorkspaceWithContext extends Workspace {
  members: WorkspaceMember[];
  teams: Team[];
  user_role: WorkspaceRole;
}

/** Response for listing the current user's workspaces. */
export interface WorkspaceListResponse {
  workspaces: WorkspaceListItem[];
}

export interface MembersListResponse {
  members: WorkspaceMember[];
}

// ============================================================================
// Team
// ============================================================================

export interface Team {
  id: string;
  workspace_id: string;
  display_name: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  created_at: string;
  profile?: {
    display_name: string | null;
    email: string | null;
  };
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

export interface TeamWithContext extends Team {
  members: Array<{
    id: string;
    team_id: string;
    user_id: string;
    role: TeamRole;
    created_at: string;
    profile?: {
      display_name: string | null;
      email: string | null;
    };
  }>;
  user_role: TeamRole | null;
}

export interface TeamsListResponse {
  teams: Team[];
}

export interface TeamMembersListResponse {
  members: TeamMember[];
}
