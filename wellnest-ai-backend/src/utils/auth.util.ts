import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { verifyToken } from './encryption.util';

interface JwtPayload {
  sub: string;
  role: string;
}

/** Decodes/verifies the Bearer token on the request and returns the user id, or throws. */
export function getAuthenticatedUserId(req: Request): string {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedException('Missing bearer token');
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyToken(token) as JwtPayload;
    return payload.sub;
  } catch {
    throw new UnauthorizedException('Invalid or expired token');
  }
}
