/**
 * @sessionplan/contracts
 *
 * Shared TypeScript wire contracts for the SessionPlan API. Type-only except for
 * the `ContractVersion` constant below.
 *
 * Public for installation convenience; not a stable external contract until 1.0.
 */

export * from './common.js';
export * from './profile.js';
export * from './context.js';
export * from './workspaces.js';
export * from './sessions.js';
export * from './logs.js';
export * from './exercises.js';
export * from './reports.js';
export * from './health.js';

/**
 * The contract revision this build was published at. Mirrors package.json
 * version so clients can report the contract they were compiled against.
 */
export const ContractVersion = '0.1.5';
