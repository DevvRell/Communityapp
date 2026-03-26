import express, { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { prisma } from './lib/prisma';
import businessesRouter from './routes/businesses';
import complaintsRouter from './routes/complaints';
import eventsRouter from './routes/events';
import photosRouter from './routes/photos';
import adminRouter from './routes/admin';
import { ensureUploadDirs, APPROVED_DIR } from './utils/uploads';

dotenv.config();
ensureUploadDirs();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.RENDER_EXTERNAL_URL,
  process.env.STAGING_URL,
].filter(Boolean) as string[];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Admin-Key, X-User-Id, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'cb5_db',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

// Swagger configuration
// Determine base URL from environment
const getBaseUrl = () => {
  // Render provides RENDER_EXTERNAL_URL in production/staging
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }
  // Fallback to explicit staging URL if set
  if (process.env.STAGING_URL) {
    return process.env.STAGING_URL;
  }
  // Default to localhost for development
  return `http://localhost:${PORT}`;
};

const baseUrl = getBaseUrl();
const servers = [
  {
    url: baseUrl,
    description: process.env.NODE_ENV === 'production' ? 'Staging server' : 'Development server',
  },
];

// Add localhost as additional server option in non-production environments
if (process.env.NODE_ENV !== 'production') {
  servers.push({
    url: `http://localhost:${PORT}`,
    description: 'Local development server',
  });
}

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CB5 Backend API',
      version: '1.0.0',
      description: 'Express TypeScript backend with PostgreSQL and Prisma',
    },
    servers: servers,
    tags: [
      { name: 'Businesses', description: 'Business directory operations' },
      { name: 'Complaints', description: 'Community complaints operations' },
      { name: 'Events', description: 'Community events operations' },
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'General', description: 'General endpoints' },
    ],
  },
  // Scan compiled JavaScript files (JSDoc comments are preserved)
  // Use absolute paths from the project root
  apis: [
    `${__dirname}/../dist/**/*.js`,
    `${__dirname}/**/*.ts` // Fallback for development
  ],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API and database
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     api:
 *                       type: string
 *                       example: up
 *                     database:
 *                       type: string
 *                       example: connected
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: unhealthy
 *                 error:
 *                   type: string
 */
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection using Prisma
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'up',
        database: 'connected',
        prisma: 'ready',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'up',
        database: 'disconnected',
        prisma: 'error',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint
 *     description: Returns a welcome message
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 documentation:
 *                   type: string
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to CB5 Backend API',
    documentation: '/api-docs',
    endpoints: {
      businesses: '/api/businesses',
      complaints: '/api/complaints',
      events: '/api/events',
      photos: '/api/photos',
      adminSubmissions: '/api/admin/submissions',
    },
  });
});

// API Routes
app.use('/api/businesses', businessesRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/photos', photosRouter);
app.use('/api/admin', adminRouter);

// Serve approved uploads only (pending/ is NOT served)
app.use('/uploads/approved', express.static(APPROVED_DIR));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 Swagger documentation: http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await pool.end();
  await prisma.$disconnect();
  process.exit(0);
});
