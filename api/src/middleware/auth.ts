import { Request, Response, NextFunction } from 'express';

/**
 * Optional auth: attach user id from header if present.
 * Use X-User-Id for development; in production use a real token (e.g. JWT).
 */
export function optionalUser(req: Request, res: Response, next: NextFunction): void {
  const userId = req.headers['x-user-id'] as string | undefined;
  const authHeader = req.headers['authorization'];
  if (userId) {
    (req as Request & { userId?: string }).userId = userId;
  } else if (authHeader?.startsWith('Bearer ')) {
    (req as Request & { userId?: string }).userId = authHeader.slice(7);
  }
  next();
}

/**
 * Require that a user identifier is present (for uploads).
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = (req as Request & { userId?: string }).userId ?? req.headers['x-user-id'] as string | undefined;
  if (!userId) {
    res.status(401).json({ error: 'Authentication required. Provide X-User-Id or Authorization header.' });
    return;
  }
  next();
}

/**
 * Require admin key for admin-only endpoints.
 * Accepts either X-Admin-Key header or Bearer token in Authorization header.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const key = process.env.ADMIN_API_KEY;
  if (!key) {
    res.status(503).json({ error: 'Admin API not configured (ADMIN_API_KEY).' });
    return;
  }
  const headerKey = req.headers['x-admin-key'] as string | undefined;
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (headerKey !== key && bearerToken !== key) {
    res.status(403).json({ error: 'Forbidden. Valid admin credentials required.' });
    return;
  }
  next();
}
