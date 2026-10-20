// Set JWT_SECRET in production. The fallback is for local development only.
export const jwtConstants = {
  secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
};
