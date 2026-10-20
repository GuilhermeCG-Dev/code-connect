import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService();
  });

  it('should create a user with a hashed password', async () => {
    const user = await service.create({
      name: 'Ana',
      email: 'ana@codeconnect.dev',
      password: 'supersecret',
    });

    expect(user.id).toBeDefined();
    expect(user.passwordHash).not.toBe('supersecret');
    expect(service.findById(user.id)).toBe(user);
    expect(service.findByEmail('ana@codeconnect.dev')).toBe(user);
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
});
