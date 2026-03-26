# Local Development Setup Guide

Step-by-step instructions to run the CB5 Community Hub app on your local machine.

---

## 1. Prerequisites

Make sure you have the following installed before starting:

| Tool | Minimum Version | Check Command |
|------|----------------|---------------|
| **Node.js** | 20.x | `node -v` |
| **npm** | 10.x | `npm -v` |
| **Docker Desktop** | Latest | `docker --version` |
| **Docker Compose** | v2+ (bundled with Docker Desktop) | `docker compose version` |

Docker Desktop must be **running** (not just installed) before you start the backend.

---

## 2. Project Structure

```
New CB/
├── api/          # Backend — Express + TypeScript + Prisma + PostgreSQL
├── ui/           # Frontend — React + Vite + Tailwind CSS
└── docs/         # Documentation
```

---

## 3. Environment Setup

### 3.1 Backend (`api/.env`)

Copy the example file and adjust if needed:

```bash
cd api
cp .env.example .env
```

The default `.env` will contain:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cb5_db"
ADMIN_API_KEY=change_me_to_a_strong_secret
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Important:**
- `ADMIN_API_KEY` is the password you'll use to log in to the admin panel. Change it to something you'll remember (e.g. `myadminpassword123`).
- `DATABASE_URL` uses the default Docker PostgreSQL credentials — no changes needed for local dev.
- `FRONTEND_URL` must match the Vite dev server URL (`http://localhost:5173`) for CORS to work.

### 3.2 Frontend (`ui/.env`)

This file should already exist. Verify it contains:

```env
VITE_API_URL=http://localhost:3000
```

If the file doesn't exist, create it:

```bash
cd ui
echo 'VITE_API_URL=http://localhost:3000' > .env
```

---

## 4. Start the Backend (Docker)

From the `api/` directory, start PostgreSQL, the API server, and Adminer:

```bash
cd api
docker compose up --build -d
```

This starts three containers:
- **cb5-postgres** — PostgreSQL 16 database on port 5432
- **cb5-backend** — Express API server on port 3000
- **cb5-adminer** — Database admin UI on port 8080

The entrypoint script automatically:
1. Waits for PostgreSQL to accept connections
2. Generates the Prisma client
3. Runs all pending database migrations
4. Starts the Express server

**Watch the logs** to confirm everything started:

```bash
docker compose logs -f app
```

Look for `Starting application...` to confirm the API is up.

---

## 5. Seed the Database

The project includes SQL seed files with realistic East New York test data. Run them inside the PostgreSQL container:

```bash
# Seed businesses (20 ENY businesses)
docker compose exec postgres psql -U postgres -d cb5_db -f /app/prisma/seed-eny-businesses.sql

# Seed events (8 upcoming 2026 community events)
docker compose exec postgres psql -U postgres -d cb5_db -f /app/prisma/seed-events.sql

# Seed complaints (10 realistic community complaints)
docker compose exec postgres psql -U postgres -d cb5_db -f /app/prisma/seed-complaints.sql
```

**Alternative:** If the above paths don't work (the SQL files may not be mounted into the container), copy and run them manually:

```bash
# Copy seed files into the container
docker cp prisma/seed-eny-businesses.sql cb5-postgres:/tmp/
docker cp prisma/seed-events.sql cb5-postgres:/tmp/
docker cp prisma/seed-complaints.sql cb5-postgres:/tmp/

# Run them
docker compose exec postgres psql -U postgres -d cb5_db -f /tmp/seed-eny-businesses.sql
docker compose exec postgres psql -U postgres -d cb5_db -f /tmp/seed-events.sql
docker compose exec postgres psql -U postgres -d cb5_db -f /tmp/seed-complaints.sql
```

---

## 6. Start the Frontend

In a **separate terminal**, install dependencies and start the Vite dev server:

```bash
cd ui
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**.

---

## 7. Verify Everything Is Running

Open these URLs in your browser to confirm:

| Service | URL | What You Should See |
|---------|-----|-------------------|
| **Frontend** | http://localhost:5173 | The CB5 Community Hub home page |
| **API Health Check** | http://localhost:3000/health | `{"status":"healthy",...}` JSON response |
| **Swagger API Docs** | http://localhost:3000/api-docs | Interactive API documentation |
| **Adminer (DB Admin)** | http://localhost:8080 | Database login page |

### Adminer Login

To browse the database via Adminer:
- **System:** PostgreSQL
- **Server:** postgres
- **Username:** postgres
- **Password:** postgres
- **Database:** cb5_db

---

## 8. Admin Panel Access

1. Navigate to **http://localhost:5173/admin/login**
2. Enter the password you set as `ADMIN_API_KEY` in `api/.env`
3. On success, you'll be redirected to the Admin Submissions panel

The Admin link will now appear in the navigation bar (it's hidden until you log in).

From the admin panel you can approve or reject:
- Business submissions
- Complaint submissions
- Event submissions
- Photo uploads
- Committee meeting notes

---

## 9. Common Troubleshooting

### Docker containers won't start

```
Error: port 5432 already in use
```

Another PostgreSQL instance is using port 5432. Either stop it or change the port in `docker-compose.yml`:

```bash
# Find what's using port 5432
lsof -i :5432

# Or stop all Docker containers and try again
docker compose down
docker compose up --build -d
```

### API returns CORS errors

Make sure `FRONTEND_URL` in `api/.env` exactly matches the frontend URL (including port):

```env
FRONTEND_URL=http://localhost:5173
```

### Database migration errors

If migrations fail on startup, you can run them manually:

```bash
docker compose exec app npx prisma migrate deploy
```

Or reset the database entirely (destroys all data):

```bash
docker compose down -v   # removes volumes (database data)
docker compose up --build -d
```

### Frontend can't connect to API

1. Confirm the API is running: `curl http://localhost:3000/health`
2. Check `ui/.env` has `VITE_API_URL=http://localhost:3000`
3. Restart the Vite dev server after changing `.env` (Vite only reads env vars on startup)

### Port 3000 already in use

Another process is using port 3000. Find and stop it:

```bash
lsof -i :3000
kill -9 <PID>
```

Or change the API port in both `api/.env` (`PORT=3001`) and `ui/.env` (`VITE_API_URL=http://localhost:3001`).

### Seed SQL errors (duplicate key)

If you run seed files more than once, you may get duplicate key errors. This is safe to ignore — the data already exists. To start fresh:

```bash
docker compose down -v
docker compose up --build -d
# Then re-run the seed commands from Step 5
```

---

## 10. Stopping Everything

```bash
# Stop all backend containers (preserves data)
cd api
docker compose down

# Stop frontend
# Press Ctrl+C in the terminal running `npm run dev`
```

To also delete the database data:

```bash
docker compose down -v
```

---

## Quick Reference

| What | Command |
|------|---------|
| Start backend | `cd api && docker compose up --build -d` |
| View backend logs | `cd api && docker compose logs -f app` |
| Start frontend | `cd ui && npm install && npm run dev` |
| Run migrations | `docker compose exec app npx prisma migrate deploy` |
| Open Prisma Studio | `docker compose exec app npx prisma studio` |
| Stop everything | `docker compose down` (in api/) + Ctrl+C (in ui/) |
| Reset database | `docker compose down -v && docker compose up --build -d` |
