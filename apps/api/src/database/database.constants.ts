// Set DATABASE_URL in production. The fallback matches docker-compose.yml for local development.
export const databaseUrl =
  process.env.DATABASE_URL ??
  'postgres://codeconnect:codeconnect@localhost:5432/codeconnect';

export const PG_POOL = Symbol('PG_POOL');
export const DATABASE = Symbol('DATABASE');
