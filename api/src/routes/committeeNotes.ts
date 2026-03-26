import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { SubmissionStatus } from '@prisma/client';
import { uploadDocuments } from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * /api/committee-notes:
 *   post:
 *     summary: Submit new committee meeting notes
 *     tags: [Committee Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - committeeName
 *               - meetingDate
 *               - callToOrderTime
 *               - chairperson
 *               - membersPresent
 *               - agendaItems
 *               - submittedBy
 *               - submitterEmail
 *             properties:
 *               committeeName:
 *                 type: string
 *               meetingDate:
 *                 type: string
 *                 format: date
 *               meetingLocation:
 *                 type: string
 *               callToOrderTime:
 *                 type: string
 *               adjournmentTime:
 *                 type: string
 *               chairperson:
 *                 type: string
 *               membersPresent:
 *                 type: string
 *               membersAbsent:
 *                 type: string
 *               guests:
 *                 type: string
 *               quorumReached:
 *                 type: boolean
 *               agendaItems:
 *                 type: string
 *                 description: JSON string array of agenda items
 *               motions:
 *                 type: string
 *                 description: JSON string array of motions
 *               actionItems:
 *                 type: string
 *                 description: JSON string array of action items
 *               publicComment:
 *                 type: string
 *               generalNotes:
 *                 type: string
 *               submittedBy:
 *                 type: string
 *               submitterEmail:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Committee notes submitted
 *       400:
 *         description: Missing required fields
 */
router.post('/', (req: Request, res: Response) => {
  uploadDocuments(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const {
        committeeName, meetingDate, meetingLocation, callToOrderTime,
        adjournmentTime, chairperson, membersPresent, membersAbsent,
        guests, quorumReached, agendaItems, motions, actionItems,
        publicComment, generalNotes, submittedBy, submitterEmail,
      } = req.body;

      if (!committeeName || !meetingDate || !callToOrderTime || !chairperson ||
          !membersPresent || !agendaItems || !submittedBy || !submitterEmail) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      let parsedAgendaItems;
      try {
        parsedAgendaItems = typeof agendaItems === 'string' ? JSON.parse(agendaItems) : agendaItems;
      } catch {
        return res.status(400).json({ error: 'agendaItems must be valid JSON' });
      }

      let parsedMotions = null;
      if (motions) {
        try {
          parsedMotions = typeof motions === 'string' ? JSON.parse(motions) : motions;
        } catch {
          return res.status(400).json({ error: 'motions must be valid JSON' });
        }
      }

      let parsedActionItems = null;
      if (actionItems) {
        try {
          parsedActionItems = typeof actionItems === 'string' ? JSON.parse(actionItems) : actionItems;
        } catch {
          return res.status(400).json({ error: 'actionItems must be valid JSON' });
        }
      }

      // Process file attachments
      const files = req.files as Express.Multer.File[] | undefined;
      const attachmentsMeta = files?.map(f => ({
        storedPath: `pending/${f.filename}`,
        originalName: f.originalname,
        mimeType: f.mimetype,
        fileSize: f.size,
      })) || null;

      const note = await prisma.committeeNote.create({
        data: {
          committeeName,
          meetingDate: new Date(meetingDate),
          meetingLocation: meetingLocation || null,
          callToOrderTime,
          adjournmentTime: adjournmentTime || null,
          chairperson,
          membersPresent,
          membersAbsent: membersAbsent || null,
          guests: guests || null,
          quorumReached: quorumReached === 'true' || quorumReached === true,
          agendaItems: parsedAgendaItems,
          motions: parsedMotions,
          actionItems: parsedActionItems,
          publicComment: publicComment || null,
          generalNotes: generalNotes || null,
          submittedBy,
          submitterEmail,
          attachments: attachmentsMeta ?? Prisma.JsonNull,
        },
      });

      res.status(201).json({
        ...note,
        meetingDate: note.meetingDate.toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error creating committee note:', error);
      res.status(500).json({ error: 'Failed to create committee note' });
    }
  });
});

/**
 * @swagger
 * /api/committee-notes:
 *   get:
 *     summary: Get approved committee notes
 *     tags: [Committee Notes]
 *     parameters:
 *       - in: query
 *         name: committee
 *         schema:
 *           type: string
 *         description: Filter by committee name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Max number of results
 *     responses:
 *       200:
 *         description: List of approved committee notes
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { committee, limit } = req.query;

    const where: any = { submissionStatus: SubmissionStatus.APPROVED };
    if (committee && typeof committee === 'string') {
      where.committeeName = committee;
    }

    const notes = await prisma.committeeNote.findMany({
      where,
      orderBy: { meetingDate: 'desc' },
      take: limit ? parseInt(limit as string) : undefined,
    });

    const formatted = notes.map(n => ({
      ...n,
      meetingDate: n.meetingDate.toISOString().split('T')[0],
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching committee notes:', error);
    res.status(500).json({ error: 'Failed to fetch committee notes' });
  }
});

/**
 * @swagger
 * /api/committee-notes/{id}:
 *   get:
 *     summary: Get a single approved committee note
 *     tags: [Committee Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Committee note details
 *       404:
 *         description: Not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const note = await prisma.committeeNote.findFirst({
      where: { id, submissionStatus: SubmissionStatus.APPROVED },
    });

    if (!note) {
      return res.status(404).json({ error: 'Committee note not found' });
    }

    res.json({
      ...note,
      meetingDate: note.meetingDate.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error fetching committee note:', error);
    res.status(500).json({ error: 'Failed to fetch committee note' });
  }
});

/**
 * @swagger
 * /api/committee-notes/{id}:
 *   put:
 *     summary: Edit a pending committee note
 *     tags: [Committee Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Committee note updated
 *       403:
 *         description: Cannot edit approved/rejected notes
 *       404:
 *         description: Not found
 */
router.put('/:id', (req: Request, res: Response) => {
  uploadDocuments(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const id = parseInt(req.params.id);

      const existing = await prisma.committeeNote.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: 'Committee note not found' });
      }
      if (existing.submissionStatus !== SubmissionStatus.PENDING) {
        return res.status(403).json({ error: 'Cannot edit notes that have been approved or rejected' });
      }

      const {
        committeeName, meetingDate, meetingLocation, callToOrderTime,
        adjournmentTime, chairperson, membersPresent, membersAbsent,
        guests, quorumReached, agendaItems, motions, actionItems,
        publicComment, generalNotes, submittedBy, submitterEmail,
      } = req.body;

      const updateData: any = {};
      if (committeeName) updateData.committeeName = committeeName;
      if (meetingDate) updateData.meetingDate = new Date(meetingDate);
      if (meetingLocation !== undefined) updateData.meetingLocation = meetingLocation || null;
      if (callToOrderTime) updateData.callToOrderTime = callToOrderTime;
      if (adjournmentTime !== undefined) updateData.adjournmentTime = adjournmentTime || null;
      if (chairperson) updateData.chairperson = chairperson;
      if (membersPresent) updateData.membersPresent = membersPresent;
      if (membersAbsent !== undefined) updateData.membersAbsent = membersAbsent || null;
      if (guests !== undefined) updateData.guests = guests || null;
      if (quorumReached !== undefined) updateData.quorumReached = quorumReached === 'true' || quorumReached === true;
      if (agendaItems) {
        try {
          updateData.agendaItems = typeof agendaItems === 'string' ? JSON.parse(agendaItems) : agendaItems;
        } catch {
          return res.status(400).json({ error: 'agendaItems must be valid JSON' });
        }
      }
      if (motions !== undefined) {
        try {
          updateData.motions = motions ? (typeof motions === 'string' ? JSON.parse(motions) : motions) : null;
        } catch {
          return res.status(400).json({ error: 'motions must be valid JSON' });
        }
      }
      if (actionItems !== undefined) {
        try {
          updateData.actionItems = actionItems ? (typeof actionItems === 'string' ? JSON.parse(actionItems) : actionItems) : null;
        } catch {
          return res.status(400).json({ error: 'actionItems must be valid JSON' });
        }
      }
      if (publicComment !== undefined) updateData.publicComment = publicComment || null;
      if (generalNotes !== undefined) updateData.generalNotes = generalNotes || null;
      if (submittedBy) updateData.submittedBy = submittedBy;
      if (submitterEmail) updateData.submitterEmail = submitterEmail;

      // Handle new file attachments — append to existing
      const files = req.files as Express.Multer.File[] | undefined;
      if (files && files.length > 0) {
        const newAttachments = files.map(f => ({
          storedPath: `pending/${f.filename}`,
          originalName: f.originalname,
          mimeType: f.mimetype,
          fileSize: f.size,
        }));
        const existingAttachments = (existing.attachments as any[]) || [];
        updateData.attachments = [...existingAttachments, ...newAttachments];
      }

      const note = await prisma.committeeNote.update({
        where: { id },
        data: updateData,
      });

      res.json({
        ...note,
        meetingDate: note.meetingDate.toISOString().split('T')[0],
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Committee note not found' });
      }
      console.error('Error updating committee note:', error);
      res.status(500).json({ error: 'Failed to update committee note' });
    }
  });
});

export default router;
