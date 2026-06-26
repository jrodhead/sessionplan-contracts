/**
 * Physical profile and training-context narrative shapes.
 *
 * Physical profile is identity-level (stored on the profiles table). Training
 * context is per-workspace narrative + programming configuration consumed by
 * the generation context.
 */
import type { UnitSystem } from './common.js';

// ============================================================================
// Physical Profile
// ============================================================================

export interface PhysicalProfile {
  dateOfBirth?: string;
  gender?: string;
  heightFeet?: number;
  heightInches?: number;
  heightCm?: number;
  weight?: number;
  /** @deprecated Read-only fallback. New writes go to weight + unitSystem. */
  weightLb?: number;
  unitSystem?: UnitSystem;
}

// ============================================================================
// Training Program Configuration
// ============================================================================

/** A planned session within the weekly structure. */
export interface PlannedSession {
  /** Session type: "upper-body", "lower-body", "full-body", "mobility", "recovery" */
  sessionType: string;
  /** Optional user-facing label (e.g., "Push Day", "Active Recovery") */
  label?: string;
  /** Optional day hint ("mon", "tue", etc.) — not enforced, just guidance */
  day?: string;
}

export interface TrainingProgramConfig {
  name: string;
  /** Slug of the selected program template, or undefined if Custom */
  templateSlug?: string;
  volumePhilosophy: '2-3-sets' | 'moderate' | 'high-volume';
  supersetStrategy: 'antagonist-preferred' | 'synergist-ok' | 'no-supersets';
  progressionModel?: 'linear' | 'block' | 'undulating' | 'autoregulated';
  weeklyDeduplication: boolean;
  /** What sessions make up a week — required for Full Week generation mode */
  weeklyPlan?: PlannedSession[];
}

export interface Sport {
  name: string;
  day?: string;
  note?: string;
}

// ============================================================================
// Narrative Profile Context (SES-13)
// ============================================================================

export type NarrativeBlockKey = 'goals' | 'program' | 'custom_instructions' | 'sport_context';
export type ProfileContextEventBlock = NarrativeBlockKey | 'movement_limitations';
export type ProfileContextWrittenBy = 'ai' | 'user' | 'legacy_import';
export type ProfileContextSourceChannel = 'chat' | 'manual_edit' | 'onboarding' | 'legacy_import';

export interface NarrativeBlock {
  text: string;
  written_at: string;
  written_by: ProfileContextWrittenBy;
}

export type ProfileNarrativeBlocks = Partial<Record<NarrativeBlockKey, NarrativeBlock>>;

// ============================================================================
// Movement Limitations
// ============================================================================

export type MovementLimitationsContextStatus = 'none' | 'active' | 'monitoring' | 'cleared';

export interface MovementLimitationsContext {
  text: string;
  status: MovementLimitationsContextStatus;
  written_at: string;
  written_by: ProfileContextWrittenBy;
}

export interface ProfileContextEvent {
  id: string;
  workspace_id: string;
  user_id: string;
  block: ProfileContextEventBlock;
  before_text: string | null;
  after_text: string | null;
  source_text: string | null;
  source_channel: ProfileContextSourceChannel;
  written_at: string;
  written_by: ProfileContextWrittenBy;
}

// ============================================================================
// Context Groups
// ============================================================================

export type ContextGroupId =
  | 'training-preferences'
  | 'programming'
  | 'physical-profile'
  | 'sports-recovery';
