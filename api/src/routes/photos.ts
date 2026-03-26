import { Router, Request, Response } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma';
import { SubmissionStatus } from '@prisma/client';
import { optionalUser, requireAuth } from '../middleware/auth';
import { uploadPhoto } from '../middleware/upload';
import { uploadToCloudinary } from '../utils/cloudinary';
import { sanitizeFilename } from '../utils/uploads';
import rateLimit from 'express-rate-limit';

export type RequestWithUser = Request & { userId?: string; file?: Express.Multer.File };

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many uploads. Limit 10 per hour.' },
  standardHeaders: true,
  keyGenerator: (req: Request) => (req as RequestWithUser).userId ?? req.ip ?? 'anonymous',
});

/**
 * POST /api/photos/upload
 * Upload a photo to Cloudinary. Stored as PENDING until admin approves.
 */
router.post(
  '/upload',
  optionalUser,
  requireAuth,
  uploadLimiter,
  (req: Request, res: Response, next) => {
    uploadPhoto(req, res, (err: unknown) => {
      if (err) {
        if (err instanceof Error && 'code' in err && (err as multer.MulterError).code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Max 10 MB.' });
        }
        return res.status(400).json({ error: err instanceof Error ? err.message : 'Upload failed' });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const file = (req as RequestWithUser).file;
      if (!file || !file.buffer) {
        return res.status(400).json({ error: 'No file uploaded. Use field name "photo".' });
      }

      const userId = (req as RequestWithUser).userId ?? undefined;
      const safeName = sanitizeFilename(file.originalname || 'upload');
      const { url, publicId } = await uploadToCloudinary(file.buffer, safeName);

      const photo = await prisma.photo.create({
        data: {
          submittedBy: userId,
          storedPath: publicId,
          mimeType: file.mimetype,
          originalName: file.originalname,
          fileSize: file.size,
          submissionStatus: SubmissionStatus.PENDING,
          url,
        },
      });

      res.status(201).json({
        id: photo.id,
        message: 'Photo submitted for review.',
        submissionStatus: 'pending',
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to upload photo.' });
    }
  }
);

/**
 * GET /api/photos
 * Public gallery: approved photos only.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const photos = await prisma.photo.findMany({
      where: { submissionStatus: SubmissionStatus.APPROVED },
      orderBy: { createdAt: 'desc' },
    });
    const list = photos.map((p) => ({
      id: p.id,
      url: p.url || '',
      originalName: p.originalName,
      submittedBy: p.submittedBy,
      createdAt: p.createdAt,
    }));
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch photos.' });
  }
});

export default router;
