import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { isAllowedMime, isAllowedExt, isAllowedDocMime, isAllowedDocExt } from '../utils/uploads';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Use memory storage — files go to Cloudinary, not local disk
const storage = multer.memoryStorage();

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

export const uploadImage = multer({
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
}).single('image');

export const uploadDocuments = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb: FileFilterCallback) => {
    const mime = file.mimetype;
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!isAllowedDocMime(mime)) {
      cb(new Error(`Invalid file type. Allowed: images and PDF. Got: ${mime}`));
      return;
    }
    if (!isAllowedDocExt(ext)) {
      cb(new Error(`Invalid file extension. Allowed: .jpg, .jpeg, .png, .gif, .webp, .pdf. Got: ${ext}`));
      return;
    }
    cb(null, true);
  },
}).array('attachments', 5);
