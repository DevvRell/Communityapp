# CB5 Backend

Express TypeScript backend with PostgreSQL, Swagger documentation, and Docker support.

## Features

- ✅ Express.js with TypeScript
- ✅ PostgreSQL database
- ✅ Swagger/OpenAPI documentation
- ✅ Docker & Docker Compose
- ✅ Health check endpoint
- ✅ Environment configuration
- ✅ Ready for Render deployment

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or yarn

## Getting Started

### Local Development (without Docker)

1. Install dependencies:
```bash
npm install
```

2. Make sure PostgreSQL is running locally on port 5432, or update `.env` file with your database credentials.

3. Start the development server:
```bash
npm run dev
```

The server will start at `http://localhost:3000`

### Docker Development (Recommended)

1. Build and start all services:
```bash
docker-compose up --build
```

This will:
- Start PostgreSQL on port 5432
- Build and start the Express app on port 3000
- Set up health checks for both services

2. Stop all services:
```bash
docker-compose down
```

3. Stop and remove volumes:
```bash
docker-compose down -v
```

## API Endpoints

### Root
- `GET /` - Welcome message

### Health Check
- `GET /health` - Returns health status of API and database

### Documentation
- `GET /api-docs` - Swagger UI documentation

## Health Check Response

Healthy response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-20T12:00:00.000Z",
  "services": {
    "api": "up",
    "database": "connected"
  }
}
```

## Submissions & Photo Moderation

- **Photos**: User uploads go to `uploads/pending/`; after admin approval they move to `uploads/approved/` and are served at `/uploads/approved/`. Pending is not publicly accessible.
- **Businesses, Complaints, Events**: Public GET endpoints return only records with `submissionStatus = APPROVED`. Admin can list/approve/reject via `/api/admin/submissions`.
- **Apply schema changes**: Run `npx prisma migrate deploy` (or `prisma migrate dev` locally) to create the `photos` table and add `submissionStatus` to businesses, complaints, events.

## Environment Variables

See `.env` file for configuration options:

- `PORT` - Server port (default: 3000)
- `POSTGRES_USER` - PostgreSQL username
- `POSTGRES_PASSWORD` - PostgreSQL password
- `POSTGRES_DB` - Database name
- `POSTGRES_HOST` - Database host
- `POSTGRES_PORT` - Database port
- `ADMIN_API_KEY` - Required for admin endpoints (e.g. approve/reject). Send as `X-Admin-Key` header.
- For photo upload, send `X-User-Id` (or `Authorization: Bearer <id>`) for rate limiting per user.

## Project Structure

```
CB5/
├── src/
│   └── index.ts          # Main application file
├── dist/                 # Compiled JavaScript (generated)
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile           # Docker image definition
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── .env                 # Environment variables
└── README.md           # This file
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

## Testing the Setup

1. Start with Docker Compose:
```bash
docker-compose up --build
```

2. Check health endpoint:
```bash
curl http://localhost:3000/health
```

3. View Swagger documentation:
Open `http://localhost:3000/api-docs` in your browser

4. Check Docker health status:
```bash
docker-compose ps
```

All services should show "healthy" status.

## Deployment

### Deploy to Render

This application is ready to deploy to Render with one click!

See the [**Render Deployment Guide**](./RENDER_DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
1. Push to GitHub
2. Connect to Render
3. Deploy with Blueprint (`render.yaml`)

Your API will be live at: `https://your-app.onrender.com`

### Other Deployment Options

The application can also be deployed to:
- **Railway** - Similar to Render
- **Fly.io** - Global deployment
- **Heroku** - Classic PaaS
- **DigitalOcean App Platform** - Managed container service
- **AWS ECS/Fargate** - Enterprise container orchestration

All require:
- PostgreSQL database connection
- Environment variables configured
- Health check at `/health`
