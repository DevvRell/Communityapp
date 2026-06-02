import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { submissionLimiter } from '../middleware/rateLimits';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CATEGORIES = new Set([
  'feature_request',
  'bug',
  'design',
  'gamification',
  'content',
  'general',
]);

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Submit launch-window feedback or feature requests
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               category:
 *                 type: string
 *               source:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback recorded
 *       400:
 *         description: Invalid input
 */
router.post('/', submissionLimiter, async (req: Request, res: Response) => {
  const rawMessage = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const rawCategory = typeof req.body?.category === 'string' ? req.body.category.trim() : '';
  const source = typeof req.body?.source === 'string' ? req.body.source.slice(0, 100) : null;

  if (rawMessage.length < 4) {
    return res.status(400).json({ error: 'Please share a few more words so we can act on it.' });
  }
  if (rawMessage.length > 2000) {
    return res.status(400).json({ error: 'That message is too long. Please keep it under 2000 characters.' });
  }

  const email = rawEmail.length > 0 ? rawEmail : null;
  if (email && (email.length > 254 || !EMAIL_RE.test(email))) {
    return res.status(400).json({ error: 'That email address looks off — please double-check it.' });
  }

  const category = rawCategory && CATEGORIES.has(rawCategory) ? rawCategory : 'general';

  try {
    await prisma.feedback.create({
      data: { message: rawMessage, email, category, source },
    });
    return res.status(200).json({ ok: true, message: 'Got it — thanks for the input!' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return res.status(500).json({ error: 'Could not save your feedback. Please try again.' });
  }
});

export default router;
