import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import type * as schema from './schema.js';

// Shared by the node-postgres driver (app) and PGlite (unit tests).
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;
