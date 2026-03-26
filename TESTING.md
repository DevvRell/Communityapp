# CB5 Community App — Testing Guide

> **Branch:** `dev` — all testing uses mock data backed by `localStorage`. No real backend required.
> Keep this file updated as new features and workflows are added.

---

## Quick Start

```bash
cd ui
npm install
npm run dev
# App runs at http://localhost:5173
```

No Docker or API server needed on `dev` branch. All data lives in the browser's `localStorage` under keys prefixed `cb5_mock_*`.

To reset all data back to seed defaults at any time, go to **Admin → Submissions** and click **Reset mock data** in the top-right corner.

---

## Pages & What Can Be Tested

### 1. Business Directory (`/business`)

| Workflow | How to test |
|---|---|
| Browse approved businesses | Load page — 7 seed businesses appear by default |
| Filter by category | Use the category dropdown (Restaurant, Retail, Services, etc.) |
| Search | Type in the search box — matches on name, description, category |
| Submit a new business | Click **Add Business**, fill out the form, submit |
| Submission pending | After submitting, the business does NOT appear in the list (it's `PENDING`) |
| Admin approval | Go to Admin page, find the submission, click **Approve** — business now shows in directory |

**Seed data categories available:** restaurant, retail, services, health, technology

---

### 2. Events (`/events`)

| Workflow | How to test |
|---|---|
| Browse approved events | 6 seed events displayed on load |
| Filter by category | Use category dropdown (Community, Business, Food & Culture, etc.) |
| Search | Search box filters by title or description |
| Attend an event | Click **Attend** — count increments, button changes to "✓ Attending" |
| Full event | When attendees = maxAttendees, button shows "Event Full" |
| Submit a new event | Click **Add Event**, fill the form (date, time, location, organizer, max attendees) |
| Submission pending | Submitted event does NOT appear until approved by admin |
| Upcoming Events strip | Bottom of page — shows future-dated approved events |

**Note:** Attend state resets on page refresh (session-only). Attendee count persists in localStorage.

---

### 3. Community Complaints (`/complaints`)

| Workflow | How to test |
|---|---|
| Browse approved complaints | 5 seed complaints shown on load |
| Filter by status | Dropdown: All Statuses / Pending / In Progress / Resolved |
| Complaint statuses | Seed data includes all three statuses for variety |
| Complaint stats | Bottom of page shows counts by status (only visible when complaints exist) |
| Submit a complaint | Click **Submit New Complaint**, fill title, category, description, location, priority, name |
| Submission pending | Submitted complaint does NOT appear publicly until admin approves it |
| Success banner | Green banner appears after submit, can be dismissed |

---

### 4. Photo Gallery (`/photos`)

| Workflow | How to test |
|---|---|
| View approved photos | 4 seed photos (placeholder images) shown in grid |
| Upload a photo | Drag & drop or click to browse — JPEG, PNG, GIF, WebP, max 10 MB |
| Preview before submit | Selected image previews in the drop zone |
| Optional name credit | "Your Name" field — shown on the card as "by [name]" |
| Submission pending | Uploaded photo does NOT appear in gallery until approved |
| Admin approval | Go to Admin, approve the photo — it appears in the gallery with thumbnail |
| Large file rejection | File > 10 MB triggers an error message |
| Wrong file type | Non-image file triggers an error message |

---

### 5. Admin — Submissions (`/admin`)

| Workflow | How to test |
|---|---|
| View pending submissions | Default view shows all pending items across all types |
| Filter by type | Type dropdown: All / Photos / Businesses / Complaints / Events |
| Filter by status | Status dropdown: Pending / Approved / Rejected |
| Approve a submission | Click **Approve** — item moves to APPROVED, disappears from Pending filter |
| Reject a submission | Click **Reject** — item moves to REJECTED |
| Photo thumbnails | Photo submissions show the actual image thumbnail |
| View approved/rejected | Switch status filter to see previously processed items |
| Result count | Header shows how many items match current filters |
| Reset all data | Click **Reset mock data** → confirm → all localStorage wiped and re-seeded |

---

## End-to-End Test Flows

### Full Submission → Approval Flow
1. Go to **Business Directory** → Add Business → submit a test business
2. Go to **Events** → Add Event → submit a test event
3. Go to **Complaints** → Submit New Complaint → submit a test complaint
4. Go to **Photo Gallery** → upload an image
5. Go to **Admin** → confirm all 4 show as `PENDING`
6. Approve each one
7. Visit each public page — confirm all 4 now appear

### Full Rejection Flow
1. Submit any item (business, event, complaint, or photo)
2. Go to **Admin** → Reject it
3. Switch filter to "Rejected" — item appears there
4. Switch back to the public page — item does NOT appear (not approved)

### Data Persistence Test
1. Submit a business
2. Close the browser tab, reopen, navigate to the page
3. The submission should still be in localStorage — visible in Admin as PENDING

---

## Mock Data — Seed Content

All seed data is injected on first page load and stored in `localStorage`. It can be inspected in DevTools → Application → Local Storage → `localhost:5173`.

| Key | Contents |
|---|---|
| `cb5_mock_businesses` | 7 sample businesses (restaurants, retail, services) |
| `cb5_mock_events` | 6 sample events (community, food, arts, sports) |
| `cb5_mock_complaints` | 5 sample complaints (various statuses and priorities) |
| `cb5_mock_photos` | 4 seed photos (placeholder image URLs) |
| `cb5_mock_next_id` | Auto-increment counter; seed IDs = 1–99, user submissions = 100+ |

---

## Clean Bizz Database Table

The local PostgreSQL database (Docker) contains a table called `"Clean Bizz"` with **49 real Brooklyn businesses** (East New York / Cypress Hills / Brownsville area). This is pre-existing community data that can be imported into the `businesses` table as seed data for production.

**Schema:**
```
name          varchar(255)
address       varchar(255)
borough       varchar(100)
zip           varchar(100)
phone_number  varchar(30)
website       text
category      varchar(100)   — e.g. Food, Retail, Non-Profit, General Services, Professional Services
sub_category  varchar(100)   — e.g. Restaurant, Beauty, Financial Services, Event Planning
```

**To query it:**
```bash
cd api
docker-compose exec postgres psql -U postgres -d cb5_db -c "SELECT * FROM \"Clean Bizz\""
```

**To import into production `businesses` table** (future task):
- Map `category` + `sub_category` → `businesses.category`
- Set `submissionStatus = 'APPROVED'` for all imported rows
- Generate descriptions where missing
- Note: first row is a header row (`name = 'Name'`) — skip it on import

---

## Known Limitations (Dev Branch)

- **No authentication** — Admin page is open to anyone on `/admin`
- **localStorage quota** — large photo uploads (~5 MB+) may hit browser storage limits; error is shown gracefully
- **Session-only attend state** — "✓ Attending" resets on refresh (attendee count persists)
- **No email validation** — forms rely on browser's built-in `type="email"` validation only
- **No pagination** — all items load at once; fine for mock data volumes

---

## Switching to Production (main branch)

On `main`, the `.jsx` mock pages are removed and `.tsx` API-wired pages take over automatically (Vite resolves `.jsx` before `.tsx`). The real backend requires:

```bash
cd api
cp .env.example .env   # fill in DATABASE_URL and ADMIN_API_KEY
docker-compose up -d
npx prisma migrate deploy
npm run dev
```

Admin endpoints require `X-Admin-Key: <ADMIN_API_KEY>` header.
