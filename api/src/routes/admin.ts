import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { SubmissionStatus } from '@prisma/client';
import { requireAdmin } from '../middleware/auth';
import { PENDING_DIR, APPROVED_DIR } from '../utils/uploads';

const router = Router();

router.use(requireAdmin);

type SubmissionType = 'photo' | 'business' | 'complaint' | 'event' | 'committeeNote';

/**
 * GET /api/admin/submissions
 * List all submissions with optional filter by type and status.
 */
router.get('/submissions', async (req: Request, res: Response) => {
  try {
    const type = (req.query.type as SubmissionType | undefined) || undefined;
    const status = (req.query.status as string) || 'pending';

    const statusEnum =
      status === 'approved'
        ? SubmissionStatus.APPROVED
        : status === 'rejected'
          ? SubmissionStatus.REJECTED
          : SubmissionStatus.PENDING;

    const result: { type: string; id: number; data: unknown; submissionStatus: string }[] = [];

    if (!type || type === 'photo') {
      const photos = await prisma.photo.findMany({
        where: { submissionStatus: statusEnum },
        orderBy: { createdAt: 'desc' },
      });
      photos.forEach((p) => {
        result.push({
          type: 'photo',
          id: p.id,
          data: p,
          submissionStatus: p.submissionStatus,
        });
      });
    }
    if (!type || type === 'business') {
      const businesses = await prisma.business.findMany({
        where: { submissionStatus: statusEnum },
        orderBy: { createdAt: 'desc' },
      });
      businesses.forEach((b) => {
        result.push({
          type: 'business',
          id: b.id,
          data: { ...b, rating: Number(b.rating) },
          submissionStatus: b.submissionStatus,
        });
      });
    }
    if (!type || type === 'complaint') {
      const complaints = await prisma.complaint.findMany({
        where: { submissionStatus: statusEnum },
        orderBy: { createdAt: 'desc' },
      });
      complaints.forEach((c) => {
        result.push({
          type: 'complaint',
          id: c.id,
          data: c,
          submissionStatus: c.submissionStatus,
        });
      });
    }
    if (!type || type === 'event') {
      const events = await prisma.event.findMany({
        where: { submissionStatus: statusEnum },
        orderBy: { createdAt: 'desc' },
      });
      events.forEach((e) => {
        result.push({
          type: 'event',
          id: e.id,
          data: e,
          submissionStatus: e.submissionStatus,
        });
      });
    }
    if (!type || type === 'committeeNote') {
      const notes = await prisma.committeeNote.findMany({
        where: { submissionStatus: statusEnum },
        orderBy: { createdAt: 'desc' },
      });
      notes.forEach((n) => {
        result.push({
          type: 'committeeNote',
          id: n.id,
          data: { ...n, meetingDate: n.meetingDate.toISOString().split('T')[0] },
          submissionStatus: n.submissionStatus,
        });
      });
    }

    res.json({ submissions: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
});

/**
 * POST /api/admin/photos/:id/approve
 * Move file to approved/ and set status to APPROVED.
 */
router.post('/photos/:id/approve', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid photo id.' });
    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) return res.status(404).json({ error: 'Photo not found.' });
    if (photo.submissionStatus === SubmissionStatus.APPROVED) {
      return res.json({ message: 'Already approved.', photo });
    }

    const pendingPath = path.join(process.cwd(), 'uploads', photo.storedPath);
    const filename = path.basename(photo.storedPath);
    const approvedPath = path.join(APPROVED_DIR, filename);

    if (fs.existsSync(pendingPath)) {
      fs.renameSync(pendingPath, approvedPath);
    }
    const newStoredPath = path.join('approved', filename);
    await prisma.photo.update({
      where: { id },
      data: { submissionStatus: SubmissionStatus.APPROVED, storedPath: newStoredPath },
    });
    res.json({ message: 'Photo approved.', id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to approve photo.' });
  }
});

/**
 * POST /api/admin/photos/:id/reject
 */
router.post('/photos/:id/reject', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid photo id.' });
    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) return res.status(404).json({ error: 'Photo not found.' });
    await prisma.photo.update({
      where: { id },
      data: { submissionStatus: SubmissionStatus.REJECTED },
    });
    const pendingPath = path.join(process.cwd(), 'uploads', photo.storedPath);
    if (fs.existsSync(pendingPath)) fs.unlinkSync(pendingPath);
    res.json({ message: 'Photo rejected.', id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to reject photo.' });
  }
});

async function setSubmissionStatus(
  type: SubmissionType,
  id: number,
  status: SubmissionStatus
): Promise<boolean> {
  if (type === 'photo') {
    await prisma.photo.update({ where: { id }, data: { submissionStatus: status } });
    return true;
  }
  if (type === 'business') {
    await prisma.business.update({ where: { id }, data: { submissionStatus: status } });
    return true;
  }
  if (type === 'complaint') {
    await prisma.complaint.update({ where: { id }, data: { submissionStatus: status } });
    return true;
  }
  if (type === 'event') {
    await prisma.event.update({ where: { id }, data: { submissionStatus: status } });
    return true;
  }
  if (type === 'committeeNote') {
    await prisma.committeeNote.update({ where: { id }, data: { submissionStatus: status } });
    return true;
  }
  return false;
}

/**
 * POST /api/admin/submissions/:type/:id/approve
 */
router.post('/submissions/:type/:id/approve', async (req: Request, res: Response) => {
  try {
    const type = req.params.type as SubmissionType;
    const id = parseInt(req.params.id, 10);
    if (!['photo', 'business', 'complaint', 'event', 'committeeNote'].includes(type) || Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid type or id.' });
    }
    if (type === 'photo') {
      const photo = await prisma.photo.findUnique({ where: { id } });
      if (!photo) return res.status(404).json({ error: 'Photo not found.' });
      if (photo.submissionStatus === SubmissionStatus.APPROVED) {
        return res.json({ message: 'Already approved.', type, id });
      }
      const pendingPath = path.join(process.cwd(), 'uploads', photo.storedPath);
      const filename = path.basename(photo.storedPath);
      const approvedPath = path.join(APPROVED_DIR, filename);
      if (fs.existsSync(pendingPath)) fs.renameSync(pendingPath, approvedPath);
      await prisma.photo.update({
        where: { id },
        data: { submissionStatus: SubmissionStatus.APPROVED, storedPath: path.join('approved', filename) },
      });
      return res.json({ message: 'Photo approved.', type, id });
    }
    const ok = await setSubmissionStatus(type, id, SubmissionStatus.APPROVED);
    if (!ok) return res.status(400).json({ error: 'Unknown type.' });
    res.json({ message: 'Approved.', type, id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to approve.' });
  }
});

/**
 * POST /api/admin/submissions/:type/:id/reject
 */
router.post('/submissions/:type/:id/reject', async (req: Request, res: Response) => {
  try {
    const type = req.params.type as SubmissionType;
    const id = parseInt(req.params.id, 10);
    if (!['photo', 'business', 'complaint', 'event', 'committeeNote'].includes(type) || Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid type or id.' });
    }
    if (type === 'photo') {
      const photo = await prisma.photo.findUnique({ where: { id } });
      if (!photo) return res.status(404).json({ error: 'Photo not found.' });
      await prisma.photo.update({ where: { id }, data: { submissionStatus: SubmissionStatus.REJECTED } });
      const pendingPath = path.join(process.cwd(), 'uploads', photo.storedPath);
      if (fs.existsSync(pendingPath)) fs.unlinkSync(pendingPath);
      return res.json({ message: 'Photo rejected.', type, id });
    }
    const ok = await setSubmissionStatus(type, id, SubmissionStatus.REJECTED);
    if (!ok) return res.status(400).json({ error: 'Unknown type.' });
    res.json({ message: 'Rejected.', type, id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to reject.' });
  }
});

export default router;
