/**
 * Public location session catalog contracts.
 */
import type { JsonValue } from './common.js';

export type PublicCatalogDifficulty = 'easy' | 'moderate' | 'hard';
export type PublicCatalogAttributionKind = 'location' | 'sessionplan';
export type PublicCatalogLogKind = 'quick' | 'full';

export interface PublicCatalogAttribution {
  name: string;
  url?: string;
  kind: PublicCatalogAttributionKind;
}

export interface LinkedSessionProvenance {
  catalogId: string;
  catalogPublicId: string;
  catalogSlug: string;
  optionId: string;
  sourceSessionId: string;
  sourceContentHash: string;
  publishedVersion: number;
  selectedSnapshotHash: string;
  effectiveLocationId: string;
  locationEquipmentSnapshot: JsonValue;
  attribution?: PublicCatalogAttribution;
  logKind?: PublicCatalogLogKind;
  signalCompleteness?: 'session-level' | 'set-level';
}

export interface PublicCatalogOptionSummary {
  id: string;
  label?: string;
  intent?: string;
  durationMinutes?: number;
  difficulty?: PublicCatalogDifficulty;
  equipmentFootprint?: string;
  safetyNotes?: string;
  sessionType?: string | null;
}

export interface PublicLocationCatalogResponse {
  catalog: {
    slug: string;
    publicId: string;
    title: string;
    attribution?: PublicCatalogAttribution;
    location: {
      name: string;
      type: 'personal' | 'commercial' | 'hotel' | 'outdoor';
      equipmentSummary: string[];
    };
    options: PublicCatalogOptionSummary[];
    noindex: boolean;
  };
}

export interface PublicCatalogOptionPreviewResponse {
  catalog: Omit<PublicLocationCatalogResponse['catalog'], 'options'>;
  option: PublicCatalogOptionSummary & {
    content: JsonValue;
    sourceContentHash: string;
    publishedVersion: number;
    selectedSnapshotHash: string;
  };
}

export interface InstantiatePublicCatalogOptionResponse {
  sessionId: string;
  session: JsonValue;
  provenance: LinkedSessionProvenance;
}
