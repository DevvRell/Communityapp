import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { SubmissionStatus } from '@prisma/client';
import { requireAdmin } from '../middleware/auth';

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
    const { category } = req.query;
    
    const where: { category?: string; submissionStatus?: SubmissionStatus } =
      category && category !== 'all'
        ? { category: category as string, submissionStatus: SubmissionStatus.APPROVED }
        : { submissionStatus: SubmissionStatus.APPROVED };

    const businesses = await prisma.business.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Convert Decimal to number for JSON response
    const formattedBusinesses = businesses.map(business => ({
      ...business,
      rating: Number(business.rating),
    }));

    res.json(formattedBusinesses);
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
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const businesses = await prisma.business.findMany({
      where: {
        submissionStatus: SubmissionStatus.APPROVED,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
          { sub_category: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedBusinesses = businesses.map(business => ({
      ...business,
      rating: Number(business.rating),
    }));

    res.json(formattedBusinesses);
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
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, category, description, address, phone, email, rating, reviews, hours, website, borough, zip, sub_category } = req.body;

    if (!name || !category || !address || !phone) {
      return res.status(400).json({ error: 'Missing required fields: name, category, address, phone' });
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
