import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid password
 */
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

export default router;
