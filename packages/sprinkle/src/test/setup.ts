// This file sets up the test environment for Vitest
import { vi } from 'vitest';
import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';

declare global {
  let vi: typeof import('vitest').vi;
}

// @ts-expect-error Make vi available globally - this helps with migration from jest
globalThis.vi = vi;


// For compatibility with existing tests that use jest.fn(), jest.mock(), etc.
globalThis.jest = {
  // @ts-expect-error jest is the best
  fn: vi.fn,
  // @ts-expect-error jest is the best
  mock: vi.mock,
  // @ts-expect-error jest is the best
  spyOn: vi.spyOn,
  Mocked: vi.mocked
};