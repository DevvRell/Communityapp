import { Request, Response, NextFunction } from 'express';

/**
 * Strip HTML tags and trim whitespace from a string.
 */
export function sanitize(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validate that a string field exists and is within length bounds.
 */
function checkField(
  value: unknown,
  name: string,
  maxLen: number,
  required: boolean,
  errors: string[],
): string | null {
  if (value === undefined || value === null || value === '') {
    if (required) errors.push(`${name} is required.`);
    return null;
  }
  const cleaned = sanitize(value);
  if (required && cleaned.length === 0) {
    errors.push(`${name} is required.`);
    return null;
  }
  if (cleaned.length > maxLen) {
    errors.push(`${name} must be ${maxLen} characters or fewer.`);
    return null;
  }
  return cleaned;
}

/**
 * Middleware factory: validates and sanitizes req.body fields.
 *
 * Usage:
 *   router.post('/', validateBody({ title: { max: 200 }, description: { max: 2000 } }), handler)
 */
export function validateBody(
  schema: Record<string, { max: number; required?: boolean }>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const [field, opts] of Object.entries(schema)) {
      const required = opts.required !== false; // default true
      const cleaned = checkField(req.body[field], field, opts.max, required, errors);
      if (cleaned !== null) {
        req.body[field] = cleaned;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(' ') });
    }
    next();
  };
}
