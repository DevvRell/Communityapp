import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { SubmissionStatus } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /api/committee-updates:
 *   get:
 *     summary: Get approved committee updates
 *     tags: [Committee Updates]
 *     responses:
 *       200:
 *         description: List of committee updates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   committeeName:
 *                     type: string
 *                   meetingDate:
 *                     type: string
 *                     format: date-time
 *                   agenda:
 *                     type: string
 *                   minutes:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const updates = await prisma.committeeUpdate.findMany({
      where: { submissionStatus: SubmissionStatus.APPROVED },
      orderBy: { meetingDate: 'desc' },
    });

    const formatted = updates.map(u => ({
      ...u,
      meetingDate: u.meetingDate.toISOString().split('T')[0],
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching committee updates:', error);
    res.status(500).json({ error: 'Failed to fetch committee updates' });
  }
});

export default router;
