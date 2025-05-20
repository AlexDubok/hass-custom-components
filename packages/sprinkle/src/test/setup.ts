// This file sets up the test environment for Vitest
import { vi } from 'vitest';
import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';

declare global {
  var vi: typeof import('vitest').vi;
}

// Make vi available globally - this helps with migration from jest
globalThis.vi = vi;


// For compatibility with existing tests that use jest.fn(), jest.mock(), etc.
// @ts-ignore
globalThis.jest = {
  // @ts-ignore
  fn: vi.fn,
  // @ts-ignore
  mock: vi.mock,
  // @ts-ignore
  spyOn: vi.spyOn,
  Mocked: vi.mocked
};