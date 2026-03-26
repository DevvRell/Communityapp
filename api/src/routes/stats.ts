import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { SubmissionStatus, ComplaintStatus } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get aggregate stats
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Aggregate counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 businesses:
 *                   type: integer
 *                 upcomingEvents:
 *                   type: integer
 *                 complaints:
 *                   type: integer
 *                 resolvedComplaints:
 *                   type: integer
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [businesses, upcomingEvents, complaints, resolvedComplaints] = await Promise.all([
      prisma.business.count({ where: { submissionStatus: SubmissionStatus.APPROVED } }),
      prisma.event.count({ where: { submissionStatus: SubmissionStatus.APPROVED, date: { gte: today } } }),
      prisma.complaint.count({ where: { submissionStatus: SubmissionStatus.APPROVED } }),
      prisma.complaint.count({ where: { submissionStatus: SubmissionStatus.APPROVED, status: ComplaintStatus.RESOLVED } }),
    ]);

    res.json({ businesses, upcomingEvents, complaints, resolvedComplaints });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
