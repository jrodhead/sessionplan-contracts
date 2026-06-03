/**
 * Tests for @sessionplan/contracts
 *
 * Verifies the runtime export (ContractVersion) and that the index re-exports
 * the expected type-level shapes. Type-only exports can't be asserted at
 * runtime, but we can confirm the module loads cleanly and that the version
 * constant is consistent with what consumers will see.
 */
import { describe, it, expect } from 'vitest';
import { ContractVersion } from '../src/index.js';
import packageJson from '../package.json';

describe('@sessionplan/contracts', () => {
  it('ContractVersion matches package.json version', () => {
    expect(ContractVersion).toBe(packageJson.version);
  });

  it('ContractVersion is a semver-shaped string', () => {
    expect(ContractVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
