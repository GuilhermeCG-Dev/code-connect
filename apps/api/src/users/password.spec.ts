import { hashPassword, verifyPassword } from './password.js';

describe('password', () => {
  it('should hash with a random salt and verify the original password', async () => {
    const first = await hashPassword('supersecret');
    const second = await hashPassword('supersecret');

    expect(first).not.toContain('supersecret');
    expect(first).not.toBe(second);
    expect(await verifyPassword('supersecret', first)).toBe(true);
  });

  it('should reject a wrong password', async () => {
    const stored = await hashPassword('supersecret');

    expect(await verifyPassword('wrongpass', stored)).toBe(false);
  });

  it('should reject a malformed stored hash', async () => {
    expect(await verifyPassword('supersecret', 'not-a-hash')).toBe(false);
  });
});
