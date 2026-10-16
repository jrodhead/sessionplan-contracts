/**
 * @sessionplan/contracts
 *
 * Shared TypeScript wire contracts for the SessionPlan API. Types, the
 * `ContractVersion` constant below, closed-vocabulary `const` data, and shared
 * rules — pure, import-free functions that two or more services must agree on
 * (see AGENTS.md for the four conditions).
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
export * from './format.js';
export * from './rpe.js';

/**
 * The contract revision this build was published at. Mirrors package.json
 * version so clients can report the contract they were compiled against.
 */
export const ContractVersion = '0.7.0';
