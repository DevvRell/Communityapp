import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ComplaintStatus, ComplaintPriority, SubmissionStatus } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Complaint:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *         - location
 *         - submittedBy
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         location:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, RESOLVED]
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *         submittedBy:
 *           type: string
 *         submittedDate:
 *           type: string
 *           format: date-time
 *         resolvedDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         response:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Helper to convert enum to UI format
const statusToUI = (status: ComplaintStatus): string => {
  const map: Record<ComplaintStatus, string> = {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    RESOLVED: 'resolved',
  };
  return map[status] || status.toLowerCase();
};

const priorityToUI = (priority: ComplaintPriority): string => {
  return priority.toLowerCase();
};

// Helper to convert UI format to enum
const statusFromUI = (status: string): ComplaintStatus => {
  const map: Record<string, ComplaintStatus> = {
    'pending': ComplaintStatus.PENDING,
    'in-progress': ComplaintStatus.IN_PROGRESS,
    'resolved': ComplaintStatus.RESOLVED,
  };
  return map[status.toLowerCase()] || ComplaintStatus.PENDING;
};

const priorityFromUI = (priority: string): ComplaintPriority => {
  const map: Record<string, ComplaintPriority> = {
    'low': ComplaintPriority.LOW,
    'medium': ComplaintPriority.MEDIUM,
    'high': ComplaintPriority.HIGH,
  };
  return map[priority.toLowerCase()] || ComplaintPriority.MEDIUM;
};

/**
 * @swagger
 * /api/complaints:
 *   get:
 *     summary: Get all complaints
 *     tags: [Complaints]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, resolved, all]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of complaints
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    const where: { status?: ComplaintStatus; submissionStatus?: SubmissionStatus } =
      status && status !== 'all'
        ? { status: statusFromUI(status as string), submissionStatus: SubmissionStatus.APPROVED }
        : { submissionStatus: SubmissionStatus.APPROVED };

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { submittedDate: 'desc' },
    });

    // Convert to UI format
    const formattedComplaints = complaints.map(complaint => ({
      ...complaint,
      status: statusToUI(complaint.status),
      priority: priorityToUI(complaint.priority),
      submittedDate: complaint.submittedDate.toISOString().split('T')[0],
      resolvedDate: complaint.resolvedDate?.toISOString().split('T')[0] || null,
    }));

    res.json(formattedComplaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

/**
 * @swagger
 * /api/complaints/{id}:
 *   get:
 *     summary: Get complaint by ID
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Complaint details
 *       404:
 *         description: Complaint not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const complaint = await prisma.complaint.findFirst({
      where: { id, submissionStatus: SubmissionStatus.APPROVED },
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({
      ...complaint,
      status: statusToUI(complaint.status),
      priority: priorityToUI(complaint.priority),
      submittedDate: complaint.submittedDate.toISOString().split('T')[0],
      resolvedDate: complaint.resolvedDate?.toISOString().split('T')[0] || null,
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Create a new complaint
 *     tags: [Complaints]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - location
 *               - submittedBy
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, resolved]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               submittedBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: Complaint created
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, category, location, status, priority, submittedBy } = req.body;

    if (!title || !description || !category || !location || !submittedBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category,
        location,
        status: status ? statusFromUI(status) : ComplaintStatus.PENDING,
        priority: priority ? priorityFromUI(priority) : ComplaintPriority.MEDIUM,
        submittedBy,
      },
    });

    res.status(201).json({
      ...complaint,
      status: statusToUI(complaint.status),
      priority: priorityToUI(complaint.priority),
      submittedDate: complaint.submittedDate.toISOString().split('T')[0],
      resolvedDate: complaint.resolvedDate?.toISOString().split('T')[0] || null,
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

/**
 * @swagger
 * /api/complaints/{id}/status:
 *   patch:
 *     summary: Update complaint status
 *     tags: [Complaints]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, resolved]
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Complaint not found
 */
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updateData: any = {
      status: statusFromUI(status),
    };

    // If resolving, set resolvedDate
    if (status === 'resolved') {
      updateData.resolvedDate = new Date();
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data: updateData,
    });

    res.json({
      ...complaint,
      status: statusToUI(complaint.status),
      priority: priorityToUI(complaint.priority),
      submittedDate: complaint.submittedDate.toISOString().split('T')[0],
      resolvedDate: complaint.resolvedDate?.toISOString().split('T')[0] || null,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    console.error('Error updating complaint status:', error);
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
});

/**
 * @swagger
 * /api/complaints/{id}/response:
 *   post:
 *     summary: Add response to complaint
 *     tags: [Complaints]
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
 *             required:
 *               - response
 *             properties:
 *               response:
 *                 type: string
 *     responses:
 *       200:
 *         description: Response added
 *       404:
 *         description: Complaint not found
 */
router.post('/:id/response', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ error: 'Response is required' });
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data: { response },
    });

    res.json({
      ...complaint,
      status: statusToUI(complaint.status),
      priority: priorityToUI(complaint.priority),
      submittedDate: complaint.submittedDate.toISOString().split('T')[0],
      resolvedDate: complaint.resolvedDate?.toISOString().split('T')[0] || null,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    console.error('Error adding response:', error);
    res.status(500).json({ error: 'Failed to add response' });
  }
});

export default router;
