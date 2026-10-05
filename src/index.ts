/**
 * @sessionplan/contracts
 *
 * Shared TypeScript wire contracts for the SessionPlan API. Types, the
 * `ContractVersion` constant below, and closed-vocabulary `const` arrays — data,
 * never logic.
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
export * from './public-catalogs.js';

/**
 * The contract revision this build was published at. Mirrors package.json
 * version so clients can report the contract they were compiled against.
 */
export const ContractVersion = '0.2.1';
