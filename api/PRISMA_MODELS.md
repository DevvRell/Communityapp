# Prisma Data Models

This document describes the Prisma data models that support the UI pages: Business Directory, Complaints, and Events.

## Overview

The Prisma schema defines three main models that correspond to the UI pages:

1. **Business** - For the Business Directory page
2. **Complaint** - For the Complaints page
3. **Event** - For the Events page

## Models

### Business Model

Maps to the Business Directory page (`ui/src/pages/BusinessDirectory.jsx`)

**Fields:**
- `id` (Int, auto-increment) - Unique identifier
- `name` (String) - Business name
- `category` (String) - Business category (e.g., "Food & Beverage", "Health & Wellness", "Technology")
- `description` (String) - Business description
- `address` (String) - Full business address
- `phone` (String) - Contact phone number
- `email` (String) - Contact email
- `rating` (Decimal) - Average rating (0-5 scale, 2 decimal places)
- `reviews` (Int) - Number of reviews
- `hours` (String) - Business hours (e.g., "Mon-Fri: 7AM-6PM, Sat-Sun: 8AM-5PM")
- `createdAt` (DateTime) - Record creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

**Indexes:**
- `category` - For filtering by category
- `name` - For search functionality

**UI Mapping:**
- All fields directly map to the mock data structure in `BusinessDirectory.jsx`
- Categories match: "Food & Beverage", "Health & Wellness", "Technology", "Home & Garden", "Retail", "Services"

### Complaint Model

Maps to the Complaints page (`ui/src/pages/ComplaintsPage.jsx`)

**Fields:**
- `id` (Int, auto-increment) - Unique identifier
- `title` (String) - Complaint title
- `description` (String) - Detailed complaint description
- `category` (String) - Complaint category (e.g., "Infrastructure", "Roads & Sidewalks", "Noise")
- `location` (String) - Location of the issue
- `status` (ComplaintStatus enum) - Current status: `PENDING`, `IN_PROGRESS`, `RESOLVED`
- `priority` (ComplaintPriority enum) - Priority level: `LOW`, `MEDIUM`, `HIGH`
- `submittedBy` (String) - Name of person who submitted the complaint
- `submittedDate` (DateTime) - When the complaint was submitted (defaults to now)
- `resolvedDate` (DateTime, nullable) - When the complaint was resolved
- `response` (String, nullable) - Official response to the complaint
- `createdAt` (DateTime) - Record creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

**Enums:**
- `ComplaintStatus`: `PENDING`, `IN_PROGRESS`, `RESOLVED`
- `ComplaintPriority`: `LOW`, `MEDIUM`, `HIGH`

**Indexes:**
- `status` - For filtering by status
- `category` - For filtering by category
- `priority` - For sorting/filtering by priority

**UI Mapping:**
- Status values map to UI: `pending`, `in-progress`, `resolved` (converted to enum format)
- Priority values map to UI: `low`, `medium`, `high` (converted to enum format)
- Categories match: "Infrastructure", "Roads & Sidewalks", "Noise", "Sanitation", "Parks & Recreation", "Traffic", "Safety", "Other"

### Event Model

Maps to the Events page (`ui/src/pages/EventsPage.jsx`)

**Fields:**
- `id` (Int, auto-increment) - Unique identifier
- `title` (String) - Event title
- `category` (String) - Event category (e.g., "Community Service", "Business", "Food & Culture")
- `description` (String) - Event description
- `date` (DateTime, Date only) - Event date
- `time` (String) - Event time range (e.g., "09:00 AM - 12:00 PM")
- `location` (String) - Event location
- `organizer` (String) - Event organizer name
- `attendees` (Int) - Current number of attendees (defaults to 0)
- `maxAttendees` (Int) - Maximum number of attendees
- `image` (String, nullable) - Event image URL
- `createdAt` (DateTime) - Record creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

**Indexes:**
- `category` - For filtering by category
- `date` - For sorting and filtering by date

**UI Mapping:**
- All fields directly map to the mock data structure in `EventsPage.jsx`
- Categories match: "Community Service", "Business", "Food & Culture", "Sports & Recreation", "Arts & Culture", "Education"

## Database Setup

### Prisma Configuration

The Prisma configuration is split between:
- `prisma/schema.prisma` - Model definitions
- `prisma.config.ts` - Database connection URL (uses `DATABASE_URL` environment variable)

### Environment Variables

Required environment variable:
- `DATABASE_URL` - PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database`
  - Example: `postgresql://postgres:postgres@localhost:5432/cb5_db`

### Prisma Client

The Prisma client is exported from `src/lib/prisma.ts` and should be imported in your API routes:

```typescript
import { prisma } from './lib/prisma';
```

## Usage Examples

### Business

```typescript
// Get all businesses
const businesses = await prisma.business.findMany();

// Get businesses by category
const foodBusinesses = await prisma.business.findMany({
  where: { category: 'Food & Beverage' }
});

// Search businesses
const results = await prisma.business.findMany({
  where: {
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } }
    ]
  }
});
```

### Complaint

```typescript
// Get all complaints
const complaints = await prisma.complaint.findMany();

// Get complaints by status
const pending = await prisma.complaint.findMany({
  where: { status: 'PENDING' }
});

// Create a new complaint
const newComplaint = await prisma.complaint.create({
  data: {
    title: 'Broken Street Light',
    description: 'Street light is out',
    category: 'Infrastructure',
    location: 'Oak Street',
    status: 'PENDING',
    priority: 'HIGH',
    submittedBy: 'John Smith'
  }
});
```

### Event

```typescript
// Get all events
const events = await prisma.event.findMany();

// Get upcoming events
const upcoming = await prisma.event.findMany({
  where: {
    date: { gte: new Date() }
  },
  orderBy: { date: 'asc' }
});

// Get events by category
const businessEvents = await prisma.event.findMany({
  where: { category: 'Business' }
});
```

## Migration Commands

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create and apply a new migration
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Next Steps

1. Run migrations to create the database tables:
   ```bash
   npm run prisma:migrate
   ```

2. Create API routes that use these models to serve data to the UI

3. Optionally create seed data to populate the database with initial records
