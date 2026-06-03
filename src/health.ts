/**
 * Health / diagnostics response shared by SessionPlan services.
 *
 * `version` is the service's own package version; `contractsVersion` is the
 * `@sessionplan/contracts` revision the service was built against. Services also
 * surface these as `X-Service-Version` / `X-Contracts-Version` response headers.
 */
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  timestamp: string;
  /** Service package version (e.g. the API or MCP server version). */
  version?: string;
  /** `@sessionplan/contracts` version the service was built against. */
  contractsVersion?: string;
  database?: {
    connected: boolean;
    exerciseCount?: number;
    locationCount?: number;
    error?: string;
  };
}
