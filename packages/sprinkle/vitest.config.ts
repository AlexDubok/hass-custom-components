/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.test.(ts|js)'],
    coverage: {
      provider: 'v8',
      enabled: false,
      include: ['**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        'test/**',
        'types/**',
        '**/*.d.ts'
      ],
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
    },
    root: 'src',
    setupFiles: './src/test/setup.ts'
  },
});