/**
 * Workspace list/detail responses and related team types.
 */
import type { WorkspaceRole, TeamRole } from './common.js';

// ============================================================================
// Workspace
// ============================================================================

/**
 * Known workspace settings keys; additional keys allowed for extensibility.
 */
export interface WorkspaceSettings {
  autoJoinNewUsers?: boolean;
  autoJoinRole?: 'member' | 'admin';
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
