# Docker Setup with Prisma Migrations

This guide explains how the Docker setup automatically populates the PostgreSQL database with Prisma migrations.

## How It Works

### 1. Database Initialization

When you run `docker-compose up`, the following happens:

1. **PostgreSQL container starts** and creates the database `cb5_db`
2. **App container waits** for PostgreSQL to be healthy
3. **Entrypoint script runs** (`docker-entrypoint.sh`) which:
   - Waits for database to be ready
   - Generates Prisma Client
   - Runs database migrations automatically
   - Starts the application

### 2. Migration Process

The `docker-entrypoint.sh` script automatically:
- Generates Prisma Client: `npx prisma generate`
- Applies migrations: `npx prisma migrate deploy`
- Falls back gracefully if migrations fail

### 3. First-Time Setup

For the first time setup, you need to create an initial migration:

```bash
# In your local development environment
cd api
npm run prisma:migrate
# This will create the initial migration in prisma/migrations/
```

Then commit the migration files to your repository. When Docker builds, it will apply these migrations automatically.

## Usage

### Start Services

```bash
cd api
docker-compose up
```

This will:
1. Start PostgreSQL database
2. Build and start the API container
3. Automatically run migrations
4. Start the Express server

### Rebuild After Schema Changes

If you change the Prisma schema:

```bash
# 1. Create a new migration locally
npm run prisma:migrate

# 2. Rebuild Docker containers
docker-compose down
docker-compose up --build
```

### View Database

You can connect to the database directly:

```bash
# Using psql
docker exec -it cb5-postgres psql -U postgres -d cb5_db

# Or use Prisma Studio
docker-compose exec app npx prisma studio
# Then open http://localhost:5555 in your browser
```

### Reset Database

To completely reset the database:

```bash
docker-compose down -v  # Removes volumes
docker-compose up --build
```

## Environment Variables

The docker-compose.yml sets these automatically:

- `DATABASE_URL`: `postgresql://postgres:postgres@postgres:5432/cb5_db`
- `POSTGRES_HOST`: `postgres` (service name)
- `POSTGRES_PORT`: `5432`
- `POSTGRES_USER`: `postgres`
- `POSTGRES_PASSWORD`: `postgres`
- `POSTGRES_DB`: `cb5_db`

## Troubleshooting

### Migrations Not Running

If migrations don't run automatically:

1. Check the container logs:
   ```bash
   docker-compose logs app
   ```

2. Manually run migrations:
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

### Database Connection Issues

1. Verify PostgreSQL is healthy:
   ```bash
   docker-compose ps
   ```

2. Test connection:
   ```bash
   docker-compose exec app npx prisma db pull
   ```

### Prisma Client Not Generated

If you see Prisma client errors:

```bash
docker-compose exec app npx prisma generate
```

## Development Workflow

### Local Development (without Docker)

```bash
# Start PostgreSQL with Docker
docker-compose up postgres -d

# Run migrations
npm run prisma:migrate

# Start dev server
npm run dev
```

### Production Build

The Dockerfile automatically:
1. Generates Prisma Client during build
2. Runs migrations on container start
3. Starts the application

No manual steps required!

## Files Involved

- `docker-compose.yml` - Service definitions
- `Dockerfile` - Multi-stage build with Prisma support
- `docker-entrypoint.sh` - Migration and startup script
- `prisma/schema.prisma` - Database schema
- `prisma.config.ts` - Prisma configuration
- `prisma/migrations/` - Migration files (created after first migration)
