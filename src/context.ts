/**
 * Generation context: the bundled, raw-data payload the API assembles for AI
 * session generation. This is the single largest contract surface.
 *
 * IMPORTANT: this is RAW DATA for the AI to interpret. It contains no
 * recommendations or training decisions — those stay with the AI client.
 */
import type { UnitSystem } from './common.js';
import type {
  PhysicalProfile,
  ProfileNarrativeBlocks,
  MovementLimitationsContext,
  PlannedSession,
} from './profile.js';
import type { ExerciseSummary } from './logs.js';
import type { ReportKPI } from './reports.js';

// ============================================================================
// Profile Context
// ============================================================================

export interface UserPreferences {
  /** Total session time in minutes (wall-clock, including warm-up and cooldown). */
  maxSessionMinutes: number;
}

export interface GenerationTrainingProgramConfig {
  /** What sessions make up a week, when the user has configured Training Availability. */
  weeklyPlan?: PlannedSession[];
}

export interface ProfileContext {
  userId: string;
  displayName?: string;
  unitSystem: UnitSystem;
  physical: PhysicalProfile;
  narrativeBlocks: ProfileNarrativeBlocks;
  movementLimitationsContext?: MovementLimitationsContext;
  trainingDays: string[];
  trainingProgram?: GenerationTrainingProgramConfig;
  defaultLocationId: string | null;
  preferences: UserPreferences;
}

// ============================================================================
// Equipment & Units
// ============================================================================

export interface EquipmentConfig {
  type?: string;
  weights?: number[];
  angles?: number[];
  available?: boolean;
}

export interface EquipmentContext {
  locationId: string;
  locationName: string;
  locationType: 'personal' | 'commercial' | 'hotel' | 'outdoor';
  equipment: Record<string, EquipmentConfig>;
  dumbbellLadder?: number[];
}

export interface UnitContext {
  system: UnitSystem;
  weight: 'lb' | 'kg';
  distance: 'mi' | 'km';
  height: 'ft' | 'cm';
}

// ============================================================================
// History
// ============================================================================

export interface ExerciseHistorySnapshot {
  date: string;
  load: string;
  reps: number;
  rpe: number;
}

export interface ExerciseHistorySummary {
  exercise: string;
  lastPerformed: string;
  lastLoad: string;
  lastReps: number;
  avgRPE: number;
  peakLoad?: string;
  peakReps?: number;
  peakDate?: string;
  recentSessions?: ExerciseHistorySnapshot[];
  volumeChange?: string;
  prAchieved?: boolean;
}

export interface ExerciseIndexLog {
  performed_at: string;
  exerciseIndex?: Record<string, ExerciseSummary>;
  unitSystem?: 'metric' | 'imperial';
}

/** Condensed from ExerciseProgressionRow — only the fields the AI needs. */
export interface ProgressionTrend {
  exercise: string;
  volumeChange: string;
  volumeChangeSentiment: 'positive' | 'neutral' | 'negative';
  sessions: string;
}

export interface ReportSummary {
  id: string;
  grade: string;
  periodStart: string;
  periodEnd: string;
  highlights: string[];
  focusAreas: string[];
  injuryStatus: string;
  kpis?: ReportKPI[];
  progressionTrends?: ProgressionTrend[];
  recommendations?: string[];
  blockRange?: string | null;
}

export interface HistoryContext {
  source: 'report' | 'logs';
  recentSessions: number;
  exerciseHistory: ExerciseHistorySummary[];
  reportSummary?: ReportSummary;
}

// ============================================================================
// Same-week sessions & continuity templates
// ============================================================================

export interface SameWeekSession {
  sessionId: string;
  title: string;
  scheduledFor: string;
  exercises: string[];
  /** Per-exercise set counts extracted from prescription (key = exercise name). */
  exerciseSets?: Record<string, number>;
}

export interface CompactPrescription {
  sets?: number | null;
  reps?: number | string | null;
  weight?: number | string | null;
  multiplier?: number | null;
  angle?: number | null;
  rpe?: number | null;
  timeSeconds?: number | null;
  holdSeconds?: number | null;
  distanceMeters?: number | null;
  distanceMiles?: number | null;
  restSeconds?: number | null;
}

export interface RecentSessionTemplateItem {
  kind: 'exercise' | 'superset' | 'circuit';
  name: string;
  link?: string | null;
  prescription?: CompactPrescription | null;
  children?: Array<{
    name: string;
    link?: string | null;
    prescription?: CompactPrescription | null;
  }> | null;
}

export interface RecentSessionTemplateSection {
  type: string;
  title: string;
  displayMode?: 'reference' | 'log' | null;
  items: RecentSessionTemplateItem[];
}

export interface RecentSessionTemplate {
  sessionId: string;
  title: string;
  scheduledFor: string | null;
  block?: number | null;
  week?: number | null;
  sessionType?: string | null;
  completion?: {
    status: 'planned' | 'logged';
    logId?: string;
    performedAt?: string;
    logKind?: 'quick' | 'full';
    signalCompleteness?: 'session-only' | 'set-level';
    completionStatus?: 'completed' | 'partial' | 'skipped';
    sessionRpe?: number;
    painType?: 'none' | 'soreness' | 'acute';
    skippedSections?: string[];
  };
  sections: RecentSessionTemplateSection[];
}

// ============================================================================
// Periodization
// ============================================================================

export interface PeriodizationSignals {
  current?: {
    block?: number;
    week?: number;
    weekInCycle?: number;
    cycleLength?: number;
    phase?: 'reset' | 'build' | 'peak' | 'deload';
  };
  lastDeload?: {
    block: number;
    week: number;
    scheduledFrom: string | null;
    scheduledTo: string | null;
    sessionIds: string[];
    detectedBy: Array<'cycle-position' | 'prescription-reduction' | 'low-rpe'>;
  };
  lastHardWeek?: {
    block: number;
    week: number;
    scheduledFrom: string | null;
    scheduledTo: string | null;
    sessionIds: string[];
    relation: 'pre-deload' | 'latest-non-deload';
  };
}

// ============================================================================
// Exercise Index
// ============================================================================

export type DefaultLogType =
  | 'strength'
  | 'isometric'
  | 'conditioning'
  | 'endurance'
  | 'carry'
  | 'mobility'
  | 'stretch';

export interface ExerciseEntry {
  name: string;
  equipment: string[];
  tags: string[];
  primary_muscles: string[];
  secondary_muscles: string[];
  movement_pattern: string | null;
  level: string | null;
  defaultLogType: DefaultLogType;
}

export interface ExerciseIndex {
  [slug: string]: ExerciseEntry;
}

/** Per-muscle-group weekly set count. */
export interface WeeklyMuscleVolume {
  muscle: string;
  sets: number;
  sessions: number;
}

// ============================================================================
// Onboarding State
// ============================================================================

/** Metadata that helps AI clients distinguish absent profile data from user-confirmed settings. */
export interface OnboardingState {
  isZeroProfile: boolean;
  hasNarrativeContext: boolean;
  hasTrainingHistory: boolean;
  hasDefaultLocation: boolean;
  defaultedFields: string[];
  recentLogCount: number;
  recentSessionCount: number;
  lastContextWriteAt: string | null;
  staleContext: boolean;
}

// ============================================================================
// Generation Context
// ============================================================================

export interface GenerationContext {
  unitSystem: UnitSystem;
  units: UnitContext;
  /** Pre-formatted delimited block for prompt assembly. */
  userUnitsBlock: string;
  profile: ProfileContext;
  equipment: EquipmentContext;
  history: HistoryContext;
  onboardingState: OnboardingState;
  exercises: ExerciseIndex;
  sameWeekSessions: SameWeekSession[];
  recentSessionTemplates: RecentSessionTemplate[];
  weeklyVolume?: WeeklyMuscleVolume[];
  derivedBlock?: number;
  derivedWeek?: number;
  periodizationSignals?: PeriodizationSignals;
}
