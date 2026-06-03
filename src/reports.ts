/**
 * Progress report content and list/detail responses.
 */

// ============================================================================
// Report Content
// ============================================================================

/** Content block within a report section. */
export interface ContentBlock {
  type: 'paragraph' | 'list';
  text?: string;
  items?: string[];
  ordered?: boolean;
}

/** Row format for exercise progression tables. */
export interface ExerciseProgressionRow {
  exercise: string;
  firstSession: string;
  peakPerformance: string;
  volumeChange: string;
  volumeChangeSentiment: 'positive' | 'neutral' | 'negative';
  sessions: string;
}

/** Table data structure for report tables. */
export interface TableData {
  type: 'generic' | 'exercise-progression';
  columns: string[];
  rows: string[][] | ExerciseProgressionRow[];
}

/** Subsection within strength analysis sections. */
export interface AnalysisSubsection {
  subtitle: string;
  table: TableData;
}

/** Union type for different report section types. */
export type ReportSection =
  | { type: 'highlight-box'; title: string; sentiment: string; content: ContentBlock[] }
  | { type: 'table'; title: string; table: TableData; summary?: string }
  | { type: 'strength-analysis'; title: string; subsections: AnalysisSubsection[] }
  | { type: 'text'; title: string; content: ContentBlock[] };

/** KPI (Key Performance Indicator) in report summary. */
export interface ReportKPI {
  label: string;
  value: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

/** Full report content structure (matches reports/*.json). */
export interface ReportContent {
  version: string;
  metadata: {
    title: string;
    period: {
      startDate: string;
      endDate: string;
      blockRange: string | null;
      weeks: number;
    };
    generatedDate: string;
  };
  summary: {
    grade: string;
    kpis: ReportKPI[];
    highlights: string[];
    injuryStatus: string;
  };
  sections: ReportSection[];
}

// ============================================================================
// Database Row & Responses
// ============================================================================

/** Report as stored in the database. */
export interface ReportRow {
  id: string;
  user_id: string;
  workspace_id: string;
  title: string;
  period_start: string;
  period_end: string;
  content: ReportContent;
  content_html: string | null;
  generated_at: string;
  created_at: string;
}

/** Request body for generating a new report. */
export interface GenerateReportRequest {
  periodStart: string;
  periodEnd: string;
  title?: string;
  customInstructions?: string;
  excludeContextGroups?: string[];
}

/** Request body for saving a pre-generated report. */
export interface SaveReportRequest {
  title?: string;
  periodStart: string;
  periodEnd: string;
  content: ReportContent;
  source?: 'reports-page' | 'week-generation';
}

/** Summary item for the report list endpoint. */
export interface ReportListItem {
  id: string;
  title: string;
  period_start: string;
  period_end: string;
  grade: string;
  generated_at: string;
}

export interface ReportPagination {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ListReportsResponse {
  data: ReportListItem[];
  pagination: ReportPagination;
}

export interface GetReportResponse {
  data: ReportRow;
}

export interface GenerateReportResponse {
  data: ReportRow;
}

export interface DeleteReportResponse {
  success: true;
}
