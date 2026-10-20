import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { testDatabaseUrl } from './test-database-url.js';

// Brings the e2e database schema up to date once before all e2e files run.
export default async function setup(): Promise<void> {
  const pool = new Pool({ connectionString: testDatabaseUrl });
  try {
    await migrate(drizzle({ client: pool }), { migrationsFolder: './drizzle' });
  } finally {
    await pool.end();
  }
}
