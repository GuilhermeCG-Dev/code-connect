import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const jwtService = new JwtService({ secret: 'test-secret' });
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    usersService = new UsersService();
    authService = new AuthService(usersService, jwtService);
    await usersService.create({
      name: 'Ana',
      email: 'ana@codeconnect.dev',
      password: 'supersecret',
    });
  });

  it('should return a JWT with the user id as subject', async () => {
    const { accessToken } = await authService.signIn(
      'ana@codeconnect.dev',
      'supersecret',
    );

    const payload = await jwtService.verifyAsync<{ sub: string }>(accessToken);
    expect(payload.sub).toBe(
      usersService.findByEmail('ana@codeconnect.dev')?.id,
    );
  });

  it('should throw UnauthorizedException for a wrong password', async () => {
    await expect(
      authService.signIn('ana@codeconnect.dev', 'wrongpass'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for an unknown email', async () => {
    await expect(
      authService.signIn('nobody@codeconnect.dev', 'supersecret'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
