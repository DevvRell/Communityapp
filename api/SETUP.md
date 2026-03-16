# Setup Guide

## What's Included

✅ **Express.js with TypeScript** - Modern backend framework  
✅ **PostgreSQL Database** - Running in Docker container  
✅ **Swagger Documentation** - Interactive API docs at `/api-docs`  
✅ **Health Check Endpoint** - `/health` endpoint that checks API and database  
✅ **Docker Compose** - Complete containerized setup  

## Prerequisites Installation

### 1. Install Docker Desktop

Docker is required to run this project. Install it from:
- **macOS**: https://docs.docker.com/desktop/install/mac-install/
- **Windows**: https://docs.docker.com/desktop/install/windows-install/
- **Linux**: https://docs.docker.com/desktop/install/linux-install/

After installation, verify Docker is running:
```bash
docker --version
docker compose version
```

### 2. Fix npm Permissions (if needed)

You have an npm permission issue. Run this command to fix it:
```bash
sudo chown -R $(whoami) "/Users/tjb/.npm"
```

## Quick Start

### Option 1: Docker Compose (Recommended)

This will start both PostgreSQL and the Express app:

```bash
# Navigate to the project directory
cd /Users/tjb/Desktop/CB5

# Start all services (PostgreSQL + Express app)
docker compose up --build

# Or run in detached mode (background)
docker compose up --build -d
```

Wait for the services to start (about 30-60 seconds). You'll see:
- PostgreSQL starting on port 5432
- Express app building and starting on port 3000

### Option 2: Local Development (requires PostgreSQL installed locally)

```bash
# Install dependencies
npm install

# Make sure PostgreSQL is running locally on port 5432

# Start development server
npm run dev
```

## Verify Everything Works

### 1. Check Docker Services Status

```bash
docker compose ps
```

You should see both services with STATUS as "healthy":
```
NAME            STATUS
cb5-backend     Up (healthy)
cb5-postgres    Up (healthy)
```

### 2. Test the Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
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

### 3. View Swagger Documentation

Open in your browser:
```
http://localhost:3000/api-docs
```

You should see the interactive Swagger UI with all API endpoints documented.

### 4. Test the Root Endpoint

```bash
curl http://localhost:3000/
```

Expected response:
```json
{
  "message": "Welcome to CB5 Backend API",
  "documentation": "/api-docs"
}
```

## Project Structure

```
CB5/
├── src/
│   └── index.ts              # Main Express application
├── docker-compose.yml        # Docker services configuration
├── Dockerfile               # App container definition
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── .dockerignore            # Files to exclude from Docker
├── .gitignore              # Files to exclude from Git
├── README.md               # Project documentation
└── SETUP.md                # This file
```

## Useful Commands

### Docker Commands

```bash
# Start services
docker compose up

# Start in background
docker compose up -d

# Rebuild and start
docker compose up --build

# Stop services
docker compose down

# Stop and remove volumes (deletes database data)
docker compose down -v

# View logs
docker compose logs

# View logs for specific service
docker compose logs app
docker compose logs postgres

# Check service health
docker compose ps
```

### Development Commands

```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start
```

## Accessing Services

- **Express API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **PostgreSQL**: localhost:5432
  - User: postgres
  - Password: postgres
  - Database: cb5_db

## Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

```bash
# Check what's using port 3000
lsof -i :3000

# Check what's using port 5432
lsof -i :5432

# Stop the Docker services and try again
docker compose down
docker compose up --build
```

### Database Connection Issues

If the health check shows database as "disconnected":

1. Ensure PostgreSQL container is running:
   ```bash
   docker compose ps
   ```

2. Check PostgreSQL logs:
   ```bash
   docker compose logs postgres
   ```

3. Restart services:
   ```bash
   docker compose down
   docker compose up --build
   ```

### npm Permission Errors

Run this to fix npm permissions:
```bash
sudo chown -R $(whoami) "/Users/tjb/.npm"
```

## Next Steps

Now that your backend is running, you can:

1. **Add more API endpoints** - Edit `src/index.ts` to add new routes
2. **Create database models** - Add TypeScript interfaces and database queries
3. **Add authentication** - Implement JWT or session-based auth
4. **Add more health checks** - Monitor additional services or metrics
5. **Connect a frontend** - Build a React/Vue/Angular app that uses this API

## Testing with curl

```bash
# Health check
curl http://localhost:3000/health

# Root endpoint
curl http://localhost:3000/

# Test with jq for pretty JSON (if installed)
curl http://localhost:3000/health | jq
```

## Environment Variables

The Docker Compose file contains all necessary environment variables. If you want to customize them:

1. Create a `.env` file in the project root
2. Add your custom values:
   ```
   PORT=3000
   POSTGRES_USER=myuser
   POSTGRES_PASSWORD=mypassword
   POSTGRES_DB=mydb
   ```
3. Update `docker-compose.yml` to use the `.env` file

## Success Criteria ✅

Your setup is complete and healthy when:

1. ✅ Docker containers are running: `docker compose ps` shows both services as "healthy"
2. ✅ Health endpoint returns 200: `curl http://localhost:3000/health` returns "healthy"
3. ✅ Swagger docs are accessible: http://localhost:3000/api-docs loads
4. ✅ Database is connected: Health check shows `database: "connected"`

All requirements are met! 🎉
