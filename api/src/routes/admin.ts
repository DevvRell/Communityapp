import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { SubmissionStatus } from '@prisma/client';
import { requireAdmin } from '../middleware/auth';
import { deleteFromCloudinary } from '../utils/cloudinary';

const router = Router();

// Login must be BEFORE requireAdmin so it's publicly accessible
router.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    return res.status(503).json({ error: 'Admin login not configured.' });
  }

  if (!password || password !== adminKey) {
    return res.status(401).json({ error: 'Invalid password.' });
  }

  res.json({ token: adminKey });
});

// All routes below require admin authentication
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
 * Set status to APPROVED. Image stays on Cloudinary.
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
    await prisma.photo.update({
      where: { id },
      data: { submissionStatus: SubmissionStatus.APPROVED },
    });
    res.json({ message: 'Photo approved.', id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to approve photo.' });
  }
});

/**
 * POST /api/admin/photos/:id/reject
 * Set status to REJECTED and delete from Cloudinary.
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
    if (photo.storedPath) {
      await deleteFromCloudinary(photo.storedPath).catch(() => {});
    }
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
      await prisma.photo.update({
        where: { id },
        data: { submissionStatus: SubmissionStatus.APPROVED },
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
 * DELETE /api/admin/submissions/:type/:id
 * Permanently remove an approved (or any) submission.
 * Photos are also deleted from Cloudinary.
 */
router.delete('/submissions/:type/:id', async (req: Request, res: Response) => {
  try {
    const type = req.params.type as SubmissionType;
    const id = parseInt(req.params.id, 10);
    if (!['photo', 'business', 'complaint', 'event', 'committeeNote'].includes(type) || Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid type or id.' });
    }

    if (type === 'photo') {
      const photo = await prisma.photo.findUnique({ where: { id } });
      if (!photo) return res.status(404).json({ error: 'Photo not found.' });
      if (photo.storedPath) {
        await deleteFromCloudinary(photo.storedPath).catch(() => {});
      }
      await prisma.photo.delete({ where: { id } });
      return res.json({ message: 'Photo deleted.', type, id });
    }
    if (type === 'business') {
      const record = await prisma.business.findUnique({ where: { id } });
      if (!record) return res.status(404).json({ error: 'Business not found.' });
      await prisma.business.delete({ where: { id } });
      return res.json({ message: 'Business deleted.', type, id });
    }
    if (type === 'complaint') {
      const record = await prisma.complaint.findUnique({ where: { id } });
      if (!record) return res.status(404).json({ error: 'Complaint not found.' });
      await prisma.complaint.delete({ where: { id } });
      return res.json({ message: 'Complaint deleted.', type, id });
    }
    if (type === 'event') {
      const record = await prisma.event.findUnique({ where: { id } });
      if (!record) return res.status(404).json({ error: 'Event not found.' });
      await prisma.event.delete({ where: { id } });
      return res.json({ message: 'Event deleted.', type, id });
    }
    if (type === 'committeeNote') {
      const record = await prisma.committeeNote.findUnique({ where: { id } });
      if (!record) return res.status(404).json({ error: 'Committee note not found.' });
      await prisma.committeeNote.delete({ where: { id } });
      return res.json({ message: 'Committee note deleted.', type, id });
    }

    return res.status(400).json({ error: 'Unknown type.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete submission.' });
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
      if (photo.storedPath) {
        await deleteFromCloudinary(photo.storedPath).catch(() => {});
      }
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
