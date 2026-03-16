# CB5 Community Board - Technical Documentation

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [System Diagram](#system-diagram)
- [Frontend (UI)](#frontend-ui)
- [Backend (API)](#backend-api)
- [Database](#database)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
- [Data Flow](#data-flow)
- [Submission & Approval Workflow](#submission--approval-workflow)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)

---

## Architecture Overview

CB5 is a community board application split into two independent services:

| Layer | Technology | Location | Port |
|-------|-----------|----------|------|
| **Frontend** | React 18 + Vite + Tailwind CSS | `ui/` | 3000 (dev) |
| **Backend** | Express + TypeScript + Prisma 7 | `api/` | 3000 (container) |
| **Database** | PostgreSQL 16 | Docker container | 5432 |
| **DB Admin** | Adminer | Docker container | 8080 |

The frontend is a single-page application (SPA) that communicates with the backend REST API over HTTP. The backend uses Prisma ORM to interact with a PostgreSQL database.

---

## System Diagram

```
┌────────────────────┐         ┌──────────────────────────┐
│                    │  HTTP   │                          │
│   React Frontend   │────────>│   Express API Server     │
│   (ui/)            │  :3000  │   (api/src/index.ts)     │
│                    │         │                          │
│   - Vite           │         │   Routes:                │
│   - Tailwind CSS   │         │   /api/businesses        │
│   - React Router   │         │   /api/complaints        │
│                    │         │   /api/events            │
│                    │         │   /api/photos            │
│                    │         │   /api/admin             │
└────────────────────┘         └────────────┬─────────────┘
                                            │
                                            │ Prisma ORM
                                            │ (pg adapter)
                                            │
                               ┌────────────▼─────────────┐
                               │                          │
                               │   PostgreSQL 16           │
                               │   Database: cb5_db        │
                               │                          │
                               │   Tables:                │
                               │   - businesses           │
                               │   - complaints           │
                               │   - events               │
                               │   - photos               │
                               │   - _prisma_migrations   │
                               │                          │
                               └──────────────────────────┘
```

---

## Frontend (UI)

**Location:** `ui/`

### Tech Stack

- **React 18** - Component framework
- **Vite 4** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS
- **React Router 6** - Client-side routing
- **Lucide React** - Icon library

### Directory Structure

```
ui/src/
├── main.jsx              # App entry point
├── App.jsx               # Router + layout (Navbar/Footer)
├── index.css             # Global styles (Tailwind)
├── components/
│   ├── Navbar.jsx        # Site navigation
│   └── Footer.jsx        # Site footer
├── pages/
│   ├── HomePage.jsx              # Landing page
│   ├── BusinessDirectory.jsx     # Business listings (mock data)
│   ├── BusinessDirectory.tsx     # Business listings (API-ready)
│   ├── EventsPage.jsx           # Events listings (mock data)
│   ├── EventsPage.tsx           # Events listings (API-ready)
│   ├── ComplaintsPage.jsx        # Complaints + form (mock data)
│   ├── ComplaintsPage.tsx        # Complaints + form (API-ready)
│   ├── CommitteeUpdatesPage.jsx  # Committee agendas & minutes
│   ├── PhotoGalleryPage.jsx      # Photo gallery + upload
│   └── AdminSubmissionsPage.jsx  # Admin approval panel
├── services/
│   ├── api.ts            # API client (fetch-based)
│   ├── apiClient.ts      # React hooks wrapping API client
│   └── index.ts          # Barrel export
├── types/
│   └── api.ts            # TypeScript interfaces
└── hooks/
    └── useDebounce.ts    # Search debounce hook
```

### Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | HomePage | Landing page with hero, stats, features |
| `/businesses` | BusinessDirectory | Searchable business directory |
| `/events` | EventsPage | Community events with filtering |
| `/complaints` | ComplaintsPage | Complaint submissions and tracking |
| `/committee-updates` | CommitteeUpdatesPage | Committee agendas and minutes |
| `/gallery` | PhotoGalleryPage | Community photo gallery |
| `/admin/submissions` | AdminSubmissionsPage | Admin review panel |

### Where Data Lives in the UI

Currently, all pages use **hardcoded mock data** defined directly inside each component. The `.tsx` versions of the page files have API calls prepared but commented out, ready to switch from mock to live data.

The API client lives in `ui/src/services/api.ts` and reads the backend URL from the `VITE_API_URL` environment variable (defaults to `http://localhost:3001/api`).

---

## Backend (API)

**Location:** `api/`

### Tech Stack

- **Express 4** - HTTP framework
- **TypeScript 5** - Type-safe JavaScript
- **Prisma 7** - ORM with PostgreSQL adapter (`@prisma/adapter-pg`)
- **Swagger (OpenAPI 3.0)** - API documentation at `/api-docs`
- **Multer** - File upload handling
- **pg** - PostgreSQL driver (used by Prisma adapter)

### Directory Structure

```
api/src/
├── index.ts              # Express app entry point
├── lib/
│   └── prisma.ts         # Singleton Prisma client
├── routes/
│   ├── businesses.ts     # Business CRUD
│   ├── complaints.ts     # Complaint CRUD + status + response
│   ├── events.ts         # Event CRUD + attendance
│   ├── photos.ts         # Photo upload + gallery
│   └── admin.ts          # Admin approval/rejection
├── middleware/
│   ├── auth.ts           # Authentication middleware
│   └── upload.ts         # Multer file upload config
└── utils/
    ├── uploads.ts        # Upload directory helpers
    └── enumConverter.ts  # Enum conversion utilities
```

### How the API Starts

1. `index.ts` loads environment variables via `dotenv`
2. Sets up Express middleware (JSON parsing, CORS)
3. Creates a PostgreSQL connection pool
4. Configures Swagger at `/api-docs`
5. Registers health check at `/health`
6. Mounts route handlers under `/api/`
7. Serves static uploads at `/uploads/approved`
8. Listens on `PORT` (default 3000)

### Prisma Client

The Prisma client (`api/src/lib/prisma.ts`) uses the **Prisma 7 driver adapter pattern**:

- Creates a `pg.Pool` using `DATABASE_URL`
- Wraps it with `@prisma/adapter-pg` (`PrismaPg`)
- Passes the adapter to `PrismaClient`
- Caches the instance on `globalThis` in development to survive hot reloads

**Import the client in any route:**
```typescript
import { prisma } from '../lib/prisma';
```

### Swagger Documentation

Interactive API docs are available at `http://localhost:3000/api-docs` when the server is running. All endpoints are documented with OpenAPI 3.0 JSDoc annotations in each route file.

---

## Database

### Connection

The database connection is configured in two places:

| File | Purpose |
|------|---------|
| `api/prisma.config.ts` | Provides `DATABASE_URL` to Prisma CLI (migrations, generate) |
| `api/src/lib/prisma.ts` | Runtime connection via `pg.Pool` + Prisma adapter |

**Connection string format:**
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

**Default (local Docker):**
```
postgresql://postgres:postgres@localhost:5432/cb5_db
```

### Where the Database Lives

| Environment | Location |
|-------------|----------|
| **Local development** | Docker container (`cb5-postgres`) on port 5432 |
| **Production (Render)** | Render PostgreSQL service (`cb5-postgres`) |

### Accessing the Database

| Method | How |
|--------|-----|
| **Adminer** (GUI) | `http://localhost:8080` — Server: `postgres`, User: `postgres`, Password: `postgres`, Database: `cb5_db` |
| **Prisma Studio** | `docker-compose exec app npx prisma studio` |
| **psql** (CLI) | `docker-compose exec postgres psql -U postgres -d cb5_db` |
| **Prisma Client** (code) | `import { prisma } from './lib/prisma'` in any route file |

### Tables

```
cb5_db
├── businesses           # Business directory entries
├── complaints           # Community complaints
├── events               # Community events
├── photos               # Uploaded photos
└── _prisma_migrations   # Prisma migration tracking
```

---

## Data Models

All models are defined in `api/prisma/schema.prisma`.

### Business

| Field | Type | Notes |
|-------|------|-------|
| id | Int | Auto-increment primary key |
| name | String | Business name |
| category | String | e.g. "Food & Beverage", "Technology" |
| description | String | Business description |
| address | String | Full street address |
| phone | String | Contact phone |
| email | String | Contact email |
| rating | Decimal(4,2) | 0.00–5.00 (clamped on input) |
| reviews | Int | Review count |
| hours | String | Operating hours text |
| submissionStatus | SubmissionStatus | PENDING / APPROVED / REJECTED |
| createdAt | DateTime | Auto-set on create |
| updatedAt | DateTime | Auto-set on update |

### Complaint

| Field | Type | Notes |
|-------|------|-------|
| id | Int | Auto-increment primary key |
| title | String | Complaint title |
| description | String | Detailed description |
| category | String | e.g. "Infrastructure", "Noise", "Traffic" |
| location | String | Issue location |
| status | ComplaintStatus | PENDING / IN_PROGRESS / RESOLVED |
| priority | ComplaintPriority | LOW / MEDIUM / HIGH |
| submittedBy | String | Submitter name |
| submittedDate | DateTime | When submitted |
| resolvedDate | DateTime? | When resolved (nullable) |
| response | String? | Official response (nullable) |
| submissionStatus | SubmissionStatus | PENDING / APPROVED / REJECTED |
| createdAt | DateTime | Auto-set on create |
| updatedAt | DateTime | Auto-set on update |

### Event

| Field | Type | Notes |
|-------|------|-------|
| id | Int | Auto-increment primary key |
| title | String | Event title |
| category | String | e.g. "Community Service", "Education" |
| description | String | Event description |
| date | Date | Event date |
| time | String | Time range (e.g. "09:00 AM - 12:00 PM") |
| location | String | Venue |
| organizer | String | Organizer name |
| attendees | Int | Current attendee count |
| maxAttendees | Int | Capacity |
| image | String? | Image URL (nullable) |
| submissionStatus | SubmissionStatus | PENDING / APPROVED / REJECTED |
| createdAt | DateTime | Auto-set on create |
| updatedAt | DateTime | Auto-set on update |

### Photo

| Field | Type | Notes |
|-------|------|-------|
| id | Int | Auto-increment primary key |
| submittedBy | String | Uploader name |
| storedPath | String | File path on server |
| mimeType | String | MIME type (image/jpeg, etc.) |
| originalName | String | Original filename |
| fileSize | Int | File size in bytes |
| submissionStatus | SubmissionStatus | PENDING / APPROVED / REJECTED |
| createdAt | DateTime | Auto-set on create |
| updatedAt | DateTime | Auto-set on update |

### Enums

```
SubmissionStatus:  PENDING | APPROVED | REJECTED
ComplaintStatus:   PENDING | IN_PROGRESS | RESOLVED
ComplaintPriority: LOW | MEDIUM | HIGH
```

---

## API Endpoints

All API routes are prefixed with `/api`.

### Businesses (`/api/businesses`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/businesses` | List all approved businesses (optional `?category=`) |
| GET | `/api/businesses/search?q=` | Search by name or description |
| GET | `/api/businesses/:id` | Get a single approved business |
| POST | `/api/businesses` | Create a new business |
| PUT | `/api/businesses/:id` | Update a business |
| DELETE | `/api/businesses/:id` | Delete a business |

### Complaints (`/api/complaints`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/complaints` | List all approved complaints (optional `?status=`) |
| GET | `/api/complaints/:id` | Get a single approved complaint |
| POST | `/api/complaints` | Create a new complaint |
| PATCH | `/api/complaints/:id/status` | Update complaint status |
| POST | `/api/complaints/:id/response` | Add a response to a complaint |

### Events (`/api/events`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/events` | List all approved events (optional `?category=`) |
| GET | `/api/events/upcoming` | Get next 10 upcoming events |
| GET | `/api/events/:id` | Get a single approved event |
| POST | `/api/events` | Create a new event |
| POST | `/api/events/:id/attend` | Register attendance (increments count) |

### Photos (`/api/photos`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/photos/upload` | Upload a photo (auth required, rate-limited) |
| GET | `/api/photos` | List all approved photos |

### Admin (`/api/admin`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/submissions` | List submissions by type and status |
| POST | `/api/admin/photos/:id/approve` | Approve a photo |
| POST | `/api/admin/photos/:id/reject` | Reject a photo |
| POST | `/api/admin/submissions/:type/:id/approve` | Approve any submission |
| POST | `/api/admin/submissions/:type/:id/reject` | Reject any submission |

### Utility Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check (API + database status) |
| GET | `/` | Root welcome message with endpoint listing |
| GET | `/api-docs` | Swagger interactive documentation |

---

## Data Flow

### Reading Data (UI -> API -> Database)

```
1. User visits /businesses in the browser
2. React component calls businessAPI.getAll()
3. Fetch request:  GET http://localhost:3000/api/businesses
4. Express routes to businesses.ts GET /
5. Prisma queries:  SELECT * FROM businesses WHERE submissionStatus = 'APPROVED'
6. Results returned as JSON
7. React renders business cards
```

### Writing Data (UI -> API -> Database)

```
1. User fills out the complaint form
2. React calls complaintsAPI.create(data)
3. Fetch request:  POST http://localhost:3000/api/complaints
4. Express routes to complaints.ts POST /
5. Prisma inserts:  INSERT INTO complaints (...)
6. New complaint returned as JSON
7. React updates the UI
```

### Data Format Conversions

The API converts between database enums and UI-friendly strings:

| Database Enum | API/UI Value |
|---------------|-------------|
| `PENDING` | `pending` |
| `IN_PROGRESS` | `in-progress` |
| `RESOLVED` | `resolved` |
| `LOW` | `low` |
| `MEDIUM` | `medium` |
| `HIGH` | `high` |

Date fields are returned as `YYYY-MM-DD` strings. Decimal fields (like `rating`) are converted to JavaScript numbers.

---

## Submission & Approval Workflow

Every entity (business, complaint, event, photo) has a `submissionStatus` field:

```
User submits     ──>  PENDING  ──>  Admin approves  ──>  APPROVED (visible to public)
                                ──>  Admin rejects   ──>  REJECTED (hidden)
```

- **Public GET endpoints** only return records where `submissionStatus = APPROVED`
- **POST endpoints** create records with `submissionStatus = PENDING` by default
- **Admin endpoints** allow changing status to `APPROVED` or `REJECTED`

---

## Local Development

### Prerequisites

- Docker & Docker Compose
- Node.js >= 20
- npm >= 10

### Start the Full Stack

```bash
# Start database + API + Adminer
cd api
docker-compose up --build -d

# Start the frontend dev server
cd ../ui
npm install
npm run dev
```

### Services Available After Startup

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 (Vite dev server) |
| API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api-docs |
| Health Check | http://localhost:3000/health |
| Adminer | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

### Running Migrations

```bash
cd api

# Create a new migration after changing schema.prisma
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cb5_db"
npx prisma migrate dev --name your_migration_name

# Apply migrations inside Docker
docker-compose exec app npx prisma migrate deploy
```

### Docker Compose Services

| Service | Container | Profile | Purpose |
|---------|-----------|---------|---------|
| `postgres` | cb5-postgres | default | PostgreSQL 16 database |
| `app` | cb5-backend | default | Production API build |
| `app-dev` | cb5-backend-dev | `dev` | Dev API with hot reload |
| `adminer` | cb5-adminer | default | Database admin UI |

To use the dev profile:
```bash
docker-compose --profile dev up app-dev
```

### Docker Entrypoint

When the `app` container starts, `docker-entrypoint.sh` automatically:

1. Waits for PostgreSQL to accept connections
2. Generates the Prisma client
3. Runs `prisma migrate deploy` to apply pending migrations
4. Starts the Express server

---

## Deployment

### Render (Production)

Both services are configured for Render deployment:

**API (`api/render.yaml`):**
- PostgreSQL as a private service
- Express app as a Docker web service
- Health check at `/health`
- Environment variables auto-injected from database

**UI (`ui/render.yaml`):**
- Static site deployment
- Build command: `npm run build`
- Publish directory: `dist/`
- SPA routing configured

### Deploy Steps

1. Push both `api/` and `ui/` to their respective GitHub repos
2. Create a Render Blueprint from `render.yaml`
3. Render automatically provisions the database and deploys the services

---

## Environment Variables

### API (`api/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/cb5_db` | PostgreSQL connection string |
| `ADMIN_API_KEY` | — | Secret key required for all `/api/admin` endpoints (set in production) |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `POSTGRES_DB` | `cb5_db` | Database name |
| `POSTGRES_HOST` | `localhost` | Database host |
| `POSTGRES_PORT` | `5432` | Database port |

### UI (`ui/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000` | Backend API base URL |
| `VITE_WEATHER_API_KEY` | — | OpenWeatherMap API key (optional) |
| `VITE_GOOGLE_MAPS_API_KEY` | — | Google Maps API key (optional) |

---

## Key Files Reference

| File | What It Does |
|------|-------------|
| `api/src/index.ts` | Express app entry point, middleware, route registration |
| `api/src/lib/prisma.ts` | Singleton Prisma client instance |
| `api/src/routes/*.ts` | Route handlers with Swagger annotations |
| `api/prisma/schema.prisma` | Database schema (models, enums, indexes) |
| `api/prisma.config.ts` | Prisma CLI configuration (datasource URL) |
| `api/docker-compose.yml` | Local development infrastructure |
| `api/docker-entrypoint.sh` | Container startup: migrations + server launch |
| `api/Dockerfile` | Production container build |
| `ui/src/App.jsx` | Frontend router and page layout |
| `ui/src/services/api.ts` | API client consumed by React components |
| `ui/src/types/api.ts` | TypeScript interfaces for API data |
