import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard, OptionalAuthGuard } from './auth.guard.js';
import { jwtConstants } from './constants.js';

function contextFor(request: object): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;
}

describe('AuthGuard', () => {
  const jwtService = new JwtService({ secret: jwtConstants.secret });
  const guard = new AuthGuard(jwtService);

  it('should reject a request without a token', async () => {
    await expect(
      guard.canActivate(contextFor({ headers: {} })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject an invalid token', async () => {
    const request = { headers: { authorization: 'Bearer invalid' } };

    await expect(guard.canActivate(contextFor(request))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should attach the payload to the request for a valid token', async () => {
    const token = await jwtService.signAsync({ sub: 'user-1', email: 'a@b.c' });
    const request: { headers: object; user?: { sub: string } } = {
      headers: { authorization: `Bearer ${token}` },
    };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user?.sub).toBe('user-1');
  });
});

describe('OptionalAuthGuard', () => {
  const jwtService = new JwtService({ secret: jwtConstants.secret });
  const guard = new OptionalAuthGuard(jwtService);

  it('should let a request without a token through as anonymous', async () => {
    const request: { headers: object; user?: unknown } = { headers: {} };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('should reject an invalid token', async () => {
    const request = { headers: { authorization: 'Bearer invalid' } };

    await expect(guard.canActivate(contextFor(request))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should attach the payload to the request for a valid token', async () => {
    const token = await jwtService.signAsync({ sub: 'user-1', email: 'a@b.c' });
    const request: { headers: object; user?: { sub: string } } = {
      headers: { authorization: `Bearer ${token}` },
    };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user?.sub).toBe('user-1');
  });
});
