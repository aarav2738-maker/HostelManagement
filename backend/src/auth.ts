import type { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { config, type AppRole } from './config.js';
import { asyncHandler } from './async-handler.js';

export interface AuthUser {
  id: string;
  role: AppRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.tokenTtl as jwt.SignOptions['expiresIn'],
  });
}

export const requireAuth: RequestHandler = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  let payload: { sub?: string };
  try {
    payload = jwt.verify(token, config.jwtSecret) as { sub?: string };
  } catch {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const row = payload.sub
    ? await db.prepare('SELECT id, role FROM users WHERE id = ?').get<{ id: string; role: AppRole }>(payload.sub)
    : undefined;
  if (!row) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  req.user = { id: row.id, role: row.role };
  next();
});

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
