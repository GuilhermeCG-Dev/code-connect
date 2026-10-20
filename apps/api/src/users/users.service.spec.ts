import { ConflictException } from '@nestjs/common';
import { createTestDatabase } from '../test/create-test-database.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    service = new UsersService(await createTestDatabase());
  });

  it('should create a user with a hashed password', async () => {
    const user = await service.create({
      name: 'Ana',
      email: 'ana@codeconnect.dev',
      password: 'supersecret',
    });

    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.passwordHash).not.toBe('supersecret');
    expect(await service.findById(user.id)).toEqual(user);
    expect(await service.findByEmail('ana@codeconnect.dev')).toEqual(user);
  });

  it('should return undefined for an unknown email', async () => {
    expect(await service.findByEmail('nobody@codeconnect.dev')).toBeUndefined();
  });

  it('should throw ConflictException for a duplicate email', async () => {
    const dto = {
      name: 'Ana',
      email: 'ana@codeconnect.dev',
      password: 'supersecret',
    };
    await service.create(dto);

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('should throw ConflictException when the unique constraint fails', async () => {
    const dto = {
      name: 'Ana',
      email: 'ana@codeconnect.dev',
      password: 'supersecret',
    };
    await service.create(dto);
    // Simulate a concurrent request that passed the pre-check.
    vi.spyOn(service, 'findByEmail').mockResolvedValueOnce(undefined);

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });
});
