/**
 * Performance log content (perf-2 format) and the computed performance summary
 * the API assembles for AI report generation.
 */
import type { UnitSystem } from './common.js';

// ============================================================================
// Core Performance Log Types (perf-2 format)
// ============================================================================

/** Performance data for a single exercise in one round/set. */
export interface ExercisePerformance {
  key: string;
  name: string;
  weight?: number;
  angle?: number;
  multiplier?: number;
  reps?: number;
  rpe?: number;
  timeSeconds?: number;
  holdSeconds?: number;
  distanceMeters?: number;
  distanceMiles?: number;
  side?: 'L' | 'R' | 'B';
  tempo?: string;
  completed?: boolean;
  notes?: string;
}

/** One set of a standalone exercise. */
export interface SetEntry {
  set?: number;
  weight?: number;
  angle?: number;
  multiplier?: number;
  reps?: number;
  rpe?: number;
  timeSeconds?: number;
  holdSeconds?: number;
  distanceMeters?: number;
  distanceMiles?: number;
  side?: 'L' | 'R' | 'B';
  tempo?: string;
  restSeconds?: number;
  completed?: boolean;
  notes?: string;
}

/** One complete round through a superset or circuit. */
export interface Round {
  round: number;
  prescribedRestSeconds?: number;
  actualRestSeconds?: number;
  notes?: string;
  exercises: ExercisePerformance[];
}

/** Session item: standalone exercise, superset, or circuit. */
export interface PerformanceItem {
  kind: 'exercise' | 'superset' | 'circuit';
  name: string;
  key?: string;
  notes?: string;
  sets?: SetEntry[];
  rounds?: Round[];
}

/** Section categories in a performance log. */
export type SectionType =
  | 'Warm-up'
  | 'Main Work'
  | 'Strength'
  | 'Conditioning'
  | 'Accessory/Core'
  | 'Cooldown/Recovery'
  | 'Recovery'
  | 'Mobility';

/** Section within a performance log. */
export interface PerformanceSection {
  type: SectionType;
  title: string;
  notes?: string;
  items: PerformanceItem[];
}

/** Pre-computed summary for fast queries. */
export interface ExerciseSummary {
  name: string;
  angle?: number;
  sectionType?: SectionType;
  sectionPath?: string;
  totalSets: number;
  totalRounds: number;
  totalReps?: number;
  avgRpe?: number;
  maxWeight?: number;
  totalVolume: number;
  jsonPaths?: string[];
}

/** Full performance log content (perf-2 format). */
export interface PerformanceLogContent {
  version: 'perf-2';
  unitSystem?: UnitSystem;
  sessionFile: string;
  workspaceId?: string;
  personaId?: string;
  userId?: string;
  teamIds?: string[];
  timestamp: string;
  date?: string;
  title?: string;
  block?: number;
  week?: number;
  notes?: string;
  quickLog?: boolean;
  completionStatus?: 'completed' | 'partial' | 'skipped';
  sessionRpe?: number;
  painType?: 'none' | 'soreness' | 'acute';
  skippedSections?: string[];
  device?: Record<string, unknown>;
  sections: PerformanceSection[];
  exerciseIndex?: Record<string, ExerciseSummary>;
}

// ============================================================================
// Request & Response Types
// ============================================================================

/** Request body for creating a performance log. */
export interface CreateLogRequest {
  session_id?: string;
  performed_at?: string;
  content: PerformanceLogContent;
  notes?: string;
}

/** Request body for updating a performance log. */
export interface UpdateLogRequest {
  performed_at?: string;
  content?: PerformanceLogContent;
  notes?: string;
}

/** Performance log as stored in the database / returned for a single log. */
export interface PerformanceLogRow {
  id: string;
  user_id: string;
  workspace_id: string;
  session_id: string | null;
  performed_at: string;
  content: PerformanceLogContent;
  exercise_index: Record<string, ExerciseSummary> | null;
  notes: string | null;
  created_at: string;
  updated_at?: string;
}

/** Summary view of a log in list responses. */
export interface LogSummary {
  id: string;
  user_id: string;
  session_id: string | null;
  performed_at: string;
  title: string | null;
  exercise_count: number;
  total_volume: number;
  avg_rpe: number | null;
  notes: string | null;
  unitSystem?: UnitSystem;
  quickLog?: boolean;
  completionStatus?: 'completed' | 'partial' | 'skipped';
  painType?: 'none' | 'soreness' | 'acute';
}

/** List logs response with cursor pagination. */
export interface ListLogsResponse {
  data: LogSummary[];
  pagination: {
    cursor: string | null;
    has_more: boolean;
  };
}

// ============================================================================
// Performance Summary (computed by API for AI input)
// ============================================================================

/** Volume trend for a single exercise. */
export interface ExerciseVolumeTrend {
  exercise: string;
  firstSession: {
    load: string;
    reps: number;
    date: string;
  };
  lastSession: {
    load: string;
    reps: number;
    date: string;
  };
  totalVolume: number;
  sessions: number;
}

/** Personal record achievement. */
export interface PRRecord {
  exercise: string;
  achievement: string;
  date: string;
}

/** Exercise frequency data. */
export interface ExerciseFrequencyItem {
  exercise: string;
  count: number;
  lastPerformed: string;
}

/** Block-specific info (for block-progression programs). */
export interface BlockInfo {
  range: string;
  weekRange?: string;
  deloadWeeks: string[];
}

/** Per-muscle-group volume rollup (weekly hard sets). */
export interface MuscleGroupVolume {
  muscle: string;
  totalSets: number;
  weeklySets: number;
}

/** Complete performance summary sent to AI for report generation. */
export interface PerformanceSummary {
  sessionCount: number;
  adherence: number;
  avgRPE: number;
  volumeTrends: ExerciseVolumeTrend[];
  prs: PRRecord[];
  exerciseFrequency: ExerciseFrequencyItem[];
  blockInfo?: BlockInfo;
  muscleGroupVolume: MuscleGroupVolume[];
}
