import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { PENDING_DIR, sanitizeFilename, isAllowedMime, isAllowedExt } from '../utils/uploads';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, PENDING_DIR);
  },
  filename: (_req, file, cb) => {
    const safe = sanitizeFilename(file.originalname || 'upload');
    const ext = path.extname(safe).toLowerCase();
    const name = path.basename(safe, ext);
    cb(null, `${name}_${Date.now()}${ext}`);
  },
});

export const uploadPhoto = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb: FileFilterCallback) => {
    const mime = file.mimetype;
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!isAllowedMime(mime)) {
      cb(new Error(`Invalid file type. Allowed: image/jpeg, image/png, image/gif, image/webp. Got: ${mime}`));
      return;
    }
    if (!isAllowedExt(ext)) {
      cb(new Error(`Invalid file extension. Allowed: .jpg, .jpeg, .png, .gif, .webp. Got: ${ext}`));
      return;
    }
    cb(null, true);
  },
}).single('photo');
