import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema.js';

// In-memory Postgres (PGlite) with the real migrations, so unit tests need no Docker.
export async function createTestDatabase(): Promise<Database> {
  const db = drizzle({ client: new PGlite(), schema });
  await migrate(db, { migrationsFolder: './drizzle' });
  return db;
}
