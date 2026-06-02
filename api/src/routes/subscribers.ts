import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { submissionLimiter } from '../middleware/rateLimits';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @swagger
 * /api/subscribe:
 *   post:
 *     summary: Register an email for launch notifications
 *     tags: [Subscribers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               source:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscribed (or already on the list)
 *       400:
 *         description: Invalid email
 */
router.post('/', submissionLimiter, async (req: Request, res: Response) => {
  const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const source = typeof req.body?.source === 'string' ? req.body.source.slice(0, 100) : null;

  if (!rawEmail || rawEmail.length > 254 || !EMAIL_RE.test(rawEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    await prisma.subscriber.create({ data: { email: rawEmail, source } });
    return res.status(200).json({ ok: true, message: "You're on the list — see you at launch!" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(200).json({ ok: true, message: "You're already on the list." });
    }
    console.error('Error saving subscriber:', error);
    return res.status(500).json({ error: 'Could not save your email. Please try again.' });
  }
});

/**
 * @swagger
 * /api/subscribe/count:
 *   get:
 *     summary: Get total subscriber count
 *     tags: [Subscribers]
 *     responses:
 *       200:
 *         description: Subscriber count
 */
router.get('/count', async (_req: Request, res: Response) => {
  try {
    const count = await prisma.subscriber.count();
    res.json({ count });
  } catch (error) {
    console.error('Error counting subscribers:', error);
    res.status(500).json({ error: 'Failed to fetch count' });
  }
});

export default router;
