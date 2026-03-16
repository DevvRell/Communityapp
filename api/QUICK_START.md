# Quick Start Guide

## First-Time Setup

### 1. Create Initial Migration

Before running Docker, create your first migration:

```bash
cd api

# Make sure DATABASE_URL is set (or use default localhost)
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cb5_db"

# Create and apply initial migration
npm run prisma:migrate
# When prompted, name it: "init"
```

This creates the migration files in `prisma/migrations/` that Docker will use.

### 2. Start with Docker

```bash
# Start PostgreSQL and API
docker-compose up --build
```

The entrypoint script will:
- ✅ Wait for database to be ready
- ✅ Generate Prisma Client
- ✅ Apply all migrations automatically
- ✅ Start the API server

### 3. Verify It Works

```bash
# Check health endpoint
curl http://localhost:3000/health

# Should return:
# {
#   "status": "healthy",
#   "services": {
#     "api": "up",
#     "database": "connected",
#     "prisma": "ready"
#   }
# }
```

### 4. View Database Schema

```bash
# Open Prisma Studio
docker-compose exec app npx prisma studio
# Opens at http://localhost:5555
```

## What Gets Created

When migrations run, these tables are created:

- `businesses` - Business directory entries
- `complaints` - Community complaints
- `events` - Community events

Plus Prisma's migration tracking table: `_prisma_migrations`

## Next Steps

- Create API routes to populate these tables
- Add seed data (optional)
- Connect your UI to the API endpoints
