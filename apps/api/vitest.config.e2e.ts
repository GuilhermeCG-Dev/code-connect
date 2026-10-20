import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { testDatabaseUrl } from './test/test-database-url.js';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    globalSetup: ['./test/global-setup.ts'],
    env: {
      DATABASE_URL: testDatabaseUrl,
      UPLOADS_DIR: join(tmpdir(), 'codeconnect-e2e-uploads'),
    },
    // Test files share one database, so run them one at a time.
    fileParallelism: false,
  },
});
