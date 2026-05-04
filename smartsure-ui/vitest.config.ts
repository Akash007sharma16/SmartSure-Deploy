import { defineConfig } from 'vitest/config';

/**
 * Vitest standalone config — enables globals so spec files work when run
 * directly via `npx vitest run` as well as via `ng test`.
 *
 * NOTE: The Angular @angular/build:unit-test builder (ng test) handles
 * Angular-specific setup (TestBed, zone.js, etc.) automatically.
 * This config only covers the globals injection for direct vitest runs.
 * For full Angular component tests always use: npx ng test --watch=false
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
});
