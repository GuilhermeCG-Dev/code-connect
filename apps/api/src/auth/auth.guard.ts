import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { jwtConstants } from './constants.js';
import type { JwtPayload } from './jwt-payload.js';

export type AuthenticatedRequest = Request & { user: JwtPayload };
export type OptionallyAuthenticatedRequest = Request & { user?: JwtPayload };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(protected readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    request.user = await this.verify(token);
    return true;
  }

  protected async verify(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: jwtConstants.secret,
      });
    } catch {
      throw new UnauthorizedException();
    }
  }
}

// Lets anonymous requests through, but still rejects an invalid token.
@Injectable()
export class OptionalAuthGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<OptionallyAuthenticatedRequest>();
    const token = extractTokenFromHeader(request);
    if (token) {
      request.user = await this.verify(token);
    }
    return true;
  }
}

function extractTokenFromHeader(request: Request): string | undefined {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
}
