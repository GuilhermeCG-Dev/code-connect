// The e2e tests truncate tables, so they never run against the dev database.
export const testDatabaseUrl =
  process.env.DATABASE_URL_TEST ??
  'postgres://codeconnect:codeconnect@localhost:5432/codeconnect_test';
