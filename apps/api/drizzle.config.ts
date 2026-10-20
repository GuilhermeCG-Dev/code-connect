import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  out: './drizzle',
  dbCredentials: {
    // Same fallback as src/database/database.constants.ts.
    url:
      process.env.DATABASE_URL ??
      'postgres://codeconnect:codeconnect@localhost:5432/codeconnect',
  },
});
