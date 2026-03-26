import { Router, Request, Response } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma';
import { SubmissionStatus } from '@prisma/client';
import { uploadImage } from '../middleware/upload';
import { uploadToCloudinary } from '../utils/cloudinary';
import { sanitizeFilename } from '../utils/uploads';
import { sanitize } from '../middleware/validate';
import { submissionLimiter } from '../middleware/rateLimits';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - date
 *         - time
 *         - location
 *         - organizer
 *         - maxAttendees
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         time:
 *           type: string
 *         location:
 *           type: string
 *         organizer:
 *           type: string
 *         attendees:
 *           type: integer
 *           default: 0
 *         maxAttendees:
 *           type: integer
 *         image:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of events
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    const where: { category?: string; submissionStatus?: SubmissionStatus } =
      category && category !== 'all'
        ? { category: category as string, submissionStatus: SubmissionStatus.APPROVED }
        : { submissionStatus: SubmissionStatus.APPROVED };

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    // Format date for UI (YYYY-MM-DD)
    const formattedEvents = events.map(event => ({
      ...event,
      date: event.date.toISOString().split('T')[0],
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * @swagger
 * /api/events/upcoming:
 *   get:
 *     summary: Get upcoming events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of upcoming events
 */
router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await prisma.event.findMany({
      where: {
        date: { gte: today },
        submissionStatus: SubmissionStatus.APPROVED,
      },
      orderBy: { date: 'asc' },
      take: 10,
    });

    const formattedEvents = events.map(event => ({
      ...event,
      date: event.date.toISOString().split('T')[0],
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
});

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const event = await prisma.event.findFirst({
      where: { id, submissionStatus: SubmissionStatus.APPROVED },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      ...event,
      date: event.date.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - date
 *               - time
 *               - location
 *               - organizer
 *               - maxAttendees
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               location:
 *                 type: string
 *               organizer:
 *                 type: string
 *               attendees:
 *                 type: integer
 *               maxAttendees:
 *                 type: integer
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created
 */
router.post('/', submissionLimiter, (req: Request, res: Response, next) => {
  uploadImage(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof Error && 'code' in err && (err as multer.MulterError).code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image too large. Max 10 MB.' });
      }
      return res.status(400).json({ error: err instanceof Error ? err.message : 'Upload failed' });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    const title = sanitize(req.body.title);
    const category = sanitize(req.body.category);
    const description = sanitize(req.body.description);
    const time = sanitize(req.body.time);
    const location = sanitize(req.body.location);
    const organizer = sanitize(req.body.organizer);
    const { date, attendees, maxAttendees } = req.body;

    if (!title || !category || !description || !date || !time || !location || !organizer || !maxAttendees) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (title.length > 200 || description.length > 2000 || location.length > 300) {
      return res.status(400).json({ error: 'One or more fields exceed maximum length.' });
    }

    let imageUrl: string | null = null;
    const file = (req as any).file as Express.Multer.File | undefined;
    if (file && file.buffer) {
      const safeName = sanitizeFilename(file.originalname || 'event-image');
      const result = await uploadToCloudinary(file.buffer, safeName);
      imageUrl = result.url;
    }

    const event = await prisma.event.create({
      data: {
        title,
        category,
        description,
        date: new Date(date),
        time,
        location,
        organizer,
        attendees: attendees ? parseInt(attendees) : 0,
        maxAttendees: parseInt(maxAttendees),
        image: imageUrl,
      },
    });

    res.status(201).json({
      ...event,
      date: event.date.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * @swagger
 * /api/events/{id}/attend:
 *   post:
 *     summary: Register attendance for an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID (optional, for future use)
 *     responses:
 *       200:
 *         description: Attendance registered
 *       400:
 *         description: Event is full
 *       404:
 *         description: Event not found
 */
router.post('/:id/attend', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.attendees >= event.maxAttendees) {
      return res.status(400).json({ error: 'Event is full' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        attendees: { increment: 1 },
      },
    });

    res.json({
      ...updatedEvent,
      date: updatedEvent.date.toISOString().split('T')[0],
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Event not found' });
    }
    console.error('Error registering attendance:', error);
    res.status(500).json({ error: 'Failed to register attendance' });
  }
});

export default router;
