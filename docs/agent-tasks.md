# CB5 Agent Task List

This file is the master work list for agent teams. Tasks are grouped into three tracks: **Research**, **Front End**, and **Back End**. Each task includes the relevant file(s) so agents can navigate directly to the source.

---

## Research

These items require decisions, investigation, or design work before implementation begins. Resolve these first so front-end and back-end agents have clear direction.

- [x] **Admin authentication strategy — RESOLVED** — Use a **single password login page**. Implementation: (1) Add `POST /api/admin/login` to the backend that accepts `{ password }` in the request body, compares it against `ADMIN_API_KEY` in env, and returns `{ token }` (the token can simply be the key itself or a signed value). (2) On the frontend, create a login page at `/admin/login` with a single password field. On success, store the token in `localStorage` under the key `adminToken`. (3) Wrap `/admin/submissions` in a `<ProtectedRoute>` component that checks for `adminToken` in localStorage and redirects to `/admin/login` if absent. (4) The Admin nav link in the Navbar should only render if `adminToken` is present. See Front End and Back End tasks below.

- [x] **YouTube channel integration — RESOLVED** — The video section belongs inside the existing **Committee Updates page** (`/committee-updates`), not a separate page. Channel: `https://www.youtube.com/@cb5eny`. Display preference in order: (1) latest Short if detectable, (2) latest regular video, (3) a random video refreshed every 24 hours as fallback. Implementation path: use the channel's **uploads RSS feed** (`https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID`) fetched server-side via a new `GET /api/youtube/latest` endpoint (avoids CORS) — the backend parses the XML, returns the latest video ID, and the frontend renders a responsive `<iframe>` embed. No YouTube Data API key is required for RSS. The channel ID for `@cb5eny` must be resolved by the agent by fetching the channel page and extracting the `channelId` from the page source. The 24-hour cache is implemented server-side. See Front End and Back End tasks below.

- [x] **Committee Updates data source — RESOLVED** — The page stays backend-driven. A `CommitteeUpdate` model will be added to the Prisma schema and served via `GET /api/committee-updates`. The hardcoded static array in `CommitteeUpdatesPage.jsx` will be replaced with API data. Additionally, a structured **meeting notes submission form** is needed — see the Research task below assigned to Agent 1, and the Front End / Back End implementation tasks that follow from it.

- [x] **Business category taxonomy — RESOLVED** — Use the categories already present in the database. The frontend filter dropdown must be updated to match exactly: `All Categories`, `Food`, `Retail`, `Non-Profit`, `General Services`, `Professional Services`, `Family Services`, `Entertainment`. No new categories should be invented. (`ui/src/pages/BusinessDirectory.tsx:27–35`)

- [x] **Footer contact info — RESOLVED** — Use the following for Brooklyn Community Board 5: email `info@brooklyncb5.org`, phone `(718) 629-4744`, address `1285 Decatur St, Brooklyn, NY 11207`. Update `Footer.jsx` accordingly.

- [ ] **Event attendance deduplication** — The `POST /api/events/:id/attend` endpoint just increments a counter with no session or user check. Anyone can spam the button. Decide whether attendance should be tracked by userId, IP address, or session cookie before fixing it.

---

### Agent 1 — Committee Updates Submission Form Research Task

> **Assigned to: Agent 1**
> Before any implementation begins on the committee updates submission form, Agent 1 must complete this research and produce a written spec. The output of this task should be added as a new file `docs/committee-notes-form-spec.md`.

**What to research:**
1. Look up what **Brooklyn Community Board 5 (CB5 East New York)** meeting minutes and agendas actually look like. Search for real examples at `https://www.brooklyn.nyc.gov/html/cb5bk` or via web search for "Brooklyn Community Board 5 meeting minutes". Identify the standard fields that appear in every set of notes (committee name, meeting date, attendees, agenda items, motions/votes, action items, etc.).
2. Based on the real structure, **design a structured submission form** with labeled fields — not a single free-text box. The form should feel like filling out an official record, not writing an essay.
3. Determine **who should build this**: it spans both front end (the form page and UI) and back end (the DB model, API endpoint, and admin approval flow). Agent 1 should recommend which sub-tasks go to which team and in what order.
4. The form must be accessed via a **dedicated button on the Committee Updates page** (e.g. "Submit Meeting Notes") that navigates to a **separate page** (e.g. `/committee-updates/submit`). It should not be an inline modal.
5. Submitted notes should go through the **existing admin approval flow** (status = PENDING until an admin approves via `/admin/submissions`) so nothing appears publicly without review.

**Output:** A spec file at `docs/committee-notes-form-spec.md` containing: (a) the proposed form fields with types and required/optional status, (b) the recommended Prisma model, (c) the API endpoints needed, (d) the task breakdown by team (FE vs BE), and (e) any open questions for the project owner.

---

## Front End

Tasks that live entirely in `ui/src/`. These can be worked in parallel once Research decisions above are made.

### Security / Auth
- [ ] **Build `/admin/login` page** — Create `ui/src/pages/AdminLoginPage.jsx`. Single centered card with a password input and "Login" button. On submit, call `POST /api/admin/login` with `{ password }`. On success, store the returned token in `localStorage` as `adminToken` and redirect to `/admin/submissions`. On failure, show an inline error message. Register the route in `App.jsx`. (`ui/src/pages/` — new file, `ui/src/App.jsx`)
- [ ] **Add `<ProtectedRoute>` component** — Create `ui/src/components/ProtectedRoute.jsx`. It reads `adminToken` from localStorage. If present, renders `children`. If absent, redirects to `/admin/login`. Wrap the `/admin/submissions` route in `App.jsx` with this component. (`ui/src/components/` — new file, `ui/src/App.jsx:25`)
- [ ] **Hide Admin link in Navbar for non-admins** — Read `adminToken` from localStorage in `Navbar.jsx`. Only render the Admin nav item if the token is present. (`ui/src/components/Navbar.jsx:14`)

### Pages — Wire to Real API
- [ ] **PhotoGalleryPage — connect upload to API** — The submit handler is mocked (`PhotoGalleryPage.jsx:41`). Wire it to `POST /api/photos/upload`. Requires passing `X-User-Id` header (use a guest ID or prompt for a name). (`ui/src/pages/PhotoGalleryPage.jsx`)
- [ ] **PhotoGalleryPage — load approved photos from API** — Replace `MOCK_APPROVED_PHOTOS` with a `useApi` call to `GET /api/photos`. (`ui/src/pages/PhotoGalleryPage.jsx:8–13`)
- [ ] **CommitteeUpdatesPage — replace hardcoded data with API** — Replace the static `committees` array with a `useApi` call to `GET /api/committee-updates`. Map the response fields to the existing rendering structure. (`ui/src/pages/CommitteeUpdatesPage.jsx:4–100`)
- [ ] **CommitteeUpdatesPage — add YouTube latest video section** — Above the committee selector, add a "Latest from CB5ENY" section. Call `GET /api/youtube/latest` on page load. Render a responsive 16:9 `<iframe>` embed using `https://www.youtube.com/embed/<videoId>`. Show a loading spinner while fetching and a graceful fallback if the request fails. (`ui/src/pages/CommitteeUpdatesPage.jsx`)
- [ ] **CommitteeUpdatesPage — add "Submit Meeting Notes" button** — Add a clearly visible button (below the page header, before the committee selector) that navigates to `/committee-updates/submit`. This page/form is defined in the spec produced by Agent 1's research task above. Do not build the form itself until `docs/committee-notes-form-spec.md` exists. (`ui/src/pages/CommitteeUpdatesPage.jsx`)
- [ ] **HomePage — replace hardcoded stats** — Replace the four static stat values with live counts from `GET /api/stats`. (`ui/src/pages/HomePage.jsx:33–38`)
- [ ] **HomePage — replace hardcoded Community Spotlight** — Replace the three hardcoded spotlight cards with a featured business (first result from `GET /api/businesses`) and the next upcoming event from `GET /api/events/upcoming`. (`ui/src/pages/HomePage.jsx:133–192`)

### UI Bugs / Incomplete Features
- [ ] **Fix Business category filter dropdown** — Replace the hardcoded categories array with the resolved taxonomy: `All Categories`, `Food`, `Retail`, `Non-Profit`, `General Services`, `Professional Services`, `Family Services`, `Entertainment`. (`ui/src/pages/BusinessDirectory.tsx:27–35`)
- [ ] **Add null guards for `email` and `description` in business cards** — Both fields are optional in the DB. Wrap them in conditional rendering so they don't display when null. The mailto Contact button should be hidden if email is null. (`ui/src/pages/BusinessDirectory.tsx:157, 169–172, 187`)
- [ ] **Fix "Directions" button on business cards** — Wire it to open `https://maps.google.com/?q=<encodeURIComponent(address)>` in a new tab. (`ui/src/pages/BusinessDirectory.tsx:193`)
- [ ] **Add "Add Event" form** — The "Add Event" button has no handler. Build an inline form or modal using the existing `useCreateEvent` hook from `apiClient.ts`. (`ui/src/pages/EventsPage.tsx:116`)
- [ ] **Prevent duplicate "Attend" clicks** — After a successful attend call, store the event ID in localStorage and disable the button for that event on subsequent page loads. (`ui/src/pages/EventsPage.tsx:186–188`)
- [ ] **Update `Business` type to include new fields** — Add `website`, `borough`, `zip`, and `sub_category` (all `string | null`) to the `Business` interface. (`ui/src/types/api.ts:10–23`)

### Polish / Cleanup
- [ ] **Add mobile hamburger menu to Navbar** — Add a responsive hamburger menu that shows on small screens and collapses the nav links into a dropdown. (`ui/src/components/Navbar.jsx`)
- [ ] **Update Footer contact info** — Replace placeholder values with: email `info@brooklyncb5.org`, phone `(718) 629-4744`, address `1285 Decatur St, Brooklyn, NY 11207`. (`ui/src/components/Footer.jsx:22–26, 64–67`)
- [ ] **Update Footer copyright year** — Change hardcoded `2024` to `{new Date().getFullYear()}`. (`ui/src/components/Footer.jsx:73`)

---

## Back End

Tasks that live in `api/src/`. These can be worked in parallel with front-end tasks.

### Security (Critical — do these first)
- [ ] **Add `POST /api/admin/login` endpoint** — Accepts `{ password }` in request body. Compares against `process.env.ADMIN_API_KEY`. Returns `{ token: ADMIN_API_KEY }` on success, 401 on failure. This is the backend half of the single-password admin auth flow. (`api/src/routes/admin.ts` or a new `api/src/routes/auth.ts`)
- [ ] **Protect `PUT /api/businesses/:id` with `requireAdmin`** — Add `requireAdmin` middleware. (`api/src/routes/businesses.ts:345`)
- [ ] **Protect `DELETE /api/businesses/:id` with `requireAdmin`** — Add `requireAdmin` middleware. (`api/src/routes/businesses.ts:403`)
- [ ] **Protect `PATCH /api/complaints/:id/status` with `requireAdmin`** — Add `requireAdmin`. (`api/src/routes/complaints.ts:281`)
- [ ] **Protect `POST /api/complaints/:id/response` with `requireAdmin`** — Add `requireAdmin`. (`api/src/routes/complaints.ts:349`)
- [ ] **Lock CORS to specific origin** — Replace wildcard `*` with the actual frontend domain read from `process.env.FRONTEND_URL`, with a fallback of `http://localhost:5173` for development. (`api/src/index.ts:25–33`)
- [ ] **Replace trivial `ADMIN_API_KEY`** — `.env` has `ADMIN_API_KEY=admin_api_key`. Set a strong random value before staging/production deploy.

### Features / Fixes
- [ ] **Fix `PUT /api/businesses/:id` to include new fields** — Add `website`, `borough`, `zip`, `sub_category` to the destructure and `updateData` block. (`api/src/routes/businesses.ts:348–365`)
- [ ] **Write test data SQL for complaints** — Create `api/prisma/seed-complaints.sql` with ~10 realistic ENY community complaints (infrastructure, noise, sanitation, safety) pre-set to `APPROVED` with a mix of statuses. Follow the pattern of `seed-eny-businesses.sql`.
- [ ] **Write test data SQL for events** — Create `api/prisma/seed-events.sql` with ~8 upcoming ENY community events (dates in 2026), mix of categories, realistic attendance counts. Follow the pattern of `seed-eny-businesses.sql`.
- [ ] **Build `GET /api/stats` endpoint** — Returns `{ businesses: number, upcomingEvents: number, complaints: number, resolvedComplaints: number }` using Prisma `count()` queries. Register at `/api/stats` in `index.ts`. (`api/src/routes/` — new file)
- [ ] **Build Committee Updates API** — Add `CommitteeUpdate` model to Prisma schema with fields: `id`, `committeeName`, `meetingDate`, `agenda` (text), `minutes` (text), `submissionStatus`, `createdAt`, `updatedAt`. Create `GET /api/committee-updates` (returns approved records) and migrate the DB. The submission endpoint (POST) will be defined after Agent 1 produces the spec in `docs/committee-notes-form-spec.md`.
- [ ] **Build `GET /api/youtube/latest` endpoint** — New file `api/src/routes/youtube.ts`. Steps: (1) Fetch `https://www.youtube.com/feeds/videos.xml?channel_id=<CB5ENY_CHANNEL_ID>` using Node `fetch`. (2) Parse XML with `fast-xml-parser` or `xml2js` to extract the latest `<yt:videoId>` from the first `<entry>`. (3) Cache result in memory with a timestamp; return cached value if under 24 hours old. (4) Return `{ videoId: string, title: string, publishedAt: string }`. (5) The channel ID must be resolved by fetching `https://www.youtube.com/@cb5eny` and extracting the `"channelId":"UC..."` value from the page source — hardcode this constant in the file. Register at `/api/youtube` in `index.ts`.
- [ ] **Add event attendance deduplication** — Pending Research decision on strategy. Hold until resolved.

### Cleanup
- [ ] **Remove unused `pg` Pool from `index.ts`** — The raw `pg.Pool` is never used for queries (all queries go through Prisma). Remove it. (`api/src/index.ts:36–42, 228–232`)
- [ ] **Add `api/.env.example`** — Document all required env vars: `DATABASE_URL`, `ADMIN_API_KEY`, `PORT`, `STAGING_URL`, `RENDER_EXTERNAL_URL`, `FRONTEND_URL`.
