import { Router, Request, Response } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma';
import { SubmissionStatus } from '@prisma/client';
import { requireAdmin } from '../middleware/auth';
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
 *     Business:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - description
 *         - address
 *         - phone
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         address:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         rating:
 *           type: number
 *           format: decimal
 *           default: 0
 *         reviews:
 *           type: integer
 *           default: 0
 *         hours:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/businesses:
 *   get:
 *     summary: Get all businesses
 *     tags: [Businesses]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of businesses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Business'
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, page, limit } = req.query;

    const where: { category?: string; submissionStatus?: SubmissionStatus } =
      category && category !== 'all'
        ? { category: category as string, submissionStatus: SubmissionStatus.APPROVED }
        : { submissionStatus: SubmissionStatus.APPROVED };

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.business.count({ where }),
    ]);

    // Convert Decimal to number for JSON response
    const formattedBusinesses = businesses.map(business => ({
      ...business,
      rating: Number(business.rating),
    }));

    res.json({ data: formattedBusinesses, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

/**
 * @swagger
 * /api/businesses/search:
 *   get:
 *     summary: Search businesses
 *     tags: [Businesses]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Business'
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, page, limit } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      submissionStatus: SubmissionStatus.APPROVED,
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
        { address: { contains: q, mode: 'insensitive' as const } },
        { sub_category: { contains: q, mode: 'insensitive' as const } },
      ],
    };

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.business.count({ where }),
    ]);

    const formattedBusinesses = businesses.map(business => ({
      ...business,
      rating: Number(business.rating),
    }));

    res.json({ data: formattedBusinesses, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error('Error searching businesses:', error);
    res.status(500).json({ error: 'Failed to search businesses' });
  }
});

/**
 * @swagger
 * /api/businesses/{id}:
 *   get:
 *     summary: Get business by ID
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Business details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       404:
 *         description: Business not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const business = await prisma.business.findFirst({
      where: { id, submissionStatus: SubmissionStatus.APPROVED },
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json({
      ...business,
      rating: Number(business.rating),
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

/**
 * @swagger
 * /api/businesses:
 *   post:
 *     summary: Create a new business
 *     tags: [Businesses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - description
 *               - address
 *               - phone
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               rating:
 *                 type: number
 *               reviews:
 *                 type: integer
 *               hours:
 *                 type: string
 *     responses:
 *       201:
 *         description: Business created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
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
    const name = sanitize(req.body.name);
    const category = sanitize(req.body.category);
    const description = sanitize(req.body.description);
    const address = sanitize(req.body.address);
    const phone = sanitize(req.body.phone);
    const email = sanitize(req.body.email);
    const hours = sanitize(req.body.hours);
    const website = sanitize(req.body.website);
    const borough = sanitize(req.body.borough);
    const zip = sanitize(req.body.zip);
    const sub_category = sanitize(req.body.sub_category);
    const { rating, reviews } = req.body;

    if (!name || !category || !address || !phone) {
      return res.status(400).json({ error: 'Missing required fields: name, category, address, phone' });
    }

    if (name.length > 200 || address.length > 300 || (description && description.length > 2000)) {
      return res.status(400).json({ error: 'One or more fields exceed maximum length.' });
    }

    // Be lenient with rating - just ensure it's a valid number between 0-5, default to 0 if invalid
    let ratingValue = 0;
    try {
      if (rating !== undefined && rating !== null && rating !== '') {
        const parsed = parseFloat(String(rating));
        if (!isNaN(parsed) && isFinite(parsed)) {
          ratingValue = Math.max(0, Math.min(5, parsed)); // Clamp between 0 and 5
        }
      }
    } catch (e) {
      // If anything goes wrong, just use 0
      ratingValue = 0;
    }

    let imageUrl: string | null = null;
    const file = (req as any).file as Express.Multer.File | undefined;
    if (file && file.buffer) {
      const safeName = sanitizeFilename(file.originalname || 'business-image');
      const result = await uploadToCloudinary(file.buffer, safeName);
      imageUrl = result.url;
    }

    const business = await prisma.business.create({
      data: {
        name,
        category,
        description: description || null,
        address,
        phone,
        email: email || null,
        rating: ratingValue,
        reviews: reviews ? parseInt(reviews) || 0 : 0,
        hours: hours || null,
        website: website || null,
        image: imageUrl,
        borough: borough || null,
        zip: zip || null,
        sub_category: sub_category || null,
      },
    });

    res.status(201).json({
      ...business,
      rating: Number(business.rating),
    });
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ error: 'Failed to create business' });
  }
});

/**
 * @swagger
 * /api/businesses/{id}:
 *   put:
 *     summary: Update a business
 *     tags: [Businesses]
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
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               rating:
 *                 type: number
 *               reviews:
 *                 type: integer
 *               hours:
 *                 type: string
 *     responses:
 *       200:
 *         description: Business updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       404:
 *         description: Business not found
 */
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, category, description, address, phone, email, rating, reviews, hours, website, borough, zip, sub_category } = req.body;

    // Validate and clamp rating to 0-5 range if provided
    let updateData: any = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description || null;
    if (address) updateData.address = address;
    if (phone) updateData.phone = phone;
    if (email !== undefined) updateData.email = email || null;
    if (rating !== undefined) {
      let ratingValue = parseFloat(rating);
      if (ratingValue < 0) ratingValue = 0;
      if (ratingValue > 5) ratingValue = 5;
      updateData.rating = ratingValue;
    }
    if (reviews !== undefined) updateData.reviews = parseInt(reviews);
    if (hours !== undefined) updateData.hours = hours || null;
    if (website !== undefined) updateData.website = website || null;
    if (borough !== undefined) updateData.borough = borough || null;
    if (zip !== undefined) updateData.zip = zip || null;
    if (sub_category !== undefined) updateData.sub_category = sub_category || null;

    const business = await prisma.business.update({
      where: { id },
      data: updateData,
    });

    res.json({
      ...business,
      rating: Number(business.rating),
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Business not found' });
    }
    console.error('Error updating business:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
});

/**
 * @swagger
 * /api/businesses/{id}:
 *   delete:
 *     summary: Delete a business
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Business deleted
 *       404:
 *         description: Business not found
 */
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.business.delete({
      where: { id },
    });

    res.json({ message: 'Business deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Business not found' });
    }
    console.error('Error deleting business:', error);
    res.status(500).json({ error: 'Failed to delete business' });
  }
});

export default router;
