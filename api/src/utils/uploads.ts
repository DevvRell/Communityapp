import fs from 'fs';
import path from 'path';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');
export const PENDING_DIR = path.join(UPLOADS_ROOT, 'pending');
export const APPROVED_DIR = path.join(UPLOADS_ROOT, 'approved');

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const ALLOWED_DOC_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']);
const MAX_FILENAME_LENGTH = 200;

/**
 * Sanitize filename to prevent directory traversal and invalid characters.
 * Only allows alphanumeric, dash, underscore, and one dot for extension.
 */
export function sanitizeFilename(originalName: string): string {
  const basename = path.basename(originalName);
  const ext = path.extname(basename).toLowerCase();
  const nameWithoutExt = basename.slice(0, basename.length - ext.length);
  const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, MAX_FILENAME_LENGTH - ext.length);
  const combined = safeName + ext;
  return combined || `upload_${Date.now()}${ext || '.bin'}`;
}

/**
 * Ensure upload directories exist. pending/ is NOT served by express. approved/ is served at /uploads/approved.
 */
export function ensureUploadDirs(): void {
  [PENDING_DIR, APPROVED_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

export function isAllowedMime(mime: string): boolean {
  return ALLOWED_MIME_TYPES.has(mime);
}

export function isAllowedExt(ext: string): boolean {
  return ALLOWED_EXTENSIONS.has(ext.toLowerCase());
}

export const ALLOWED_DOC_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
]);

export function isAllowedDocMime(mime: string): boolean {
  return ALLOWED_DOC_MIME_TYPES.has(mime);
}

export function isAllowedDocExt(ext: string): boolean {
  return ALLOWED_DOC_EXTENSIONS.has(ext.toLowerCase());
}
