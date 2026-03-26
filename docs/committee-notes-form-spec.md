# Committee Meeting Notes Submission Form — Spec

> **Author:** Agent 1 (PM)
> **Date:** 2026-03-25
> **Status:** Draft — awaiting project owner review

---

## Background

Brooklyn Community Board 5 (CB5) operates eight standing committees that meet monthly at 127 Pennsylvania Avenue, Brooklyn, NY 11207. NYC community board meeting minutes follow a structured format: roll call, public session, elected official reports, committee reports, motions/votes, and adjournment. This form captures that structure in a way that feels like filling out an official record.

### CB5 Committees (from brooklyncb5.org)

| Committee | Meets |
|-----------|-------|
| Aging, Health & Social Services | 2nd Tuesday, 6:30 PM |
| Cannabis | 1st Monday, 6:30 PM |
| Economic Development, IBZ, & BIDs | 2nd Wednesday, 6:30 PM |
| Education & Youth Services | 1st Thursday, 6:30 PM |
| Land Use & Housing | 3rd Tuesday, 6:30 PM |
| Parks, Sanitation & Environment | 1st Tuesday, 6:00 PM |
| Public Safety & Quality of Life | 2nd Monday, 6:00 PM |
| Transportation & TLC | 3rd Monday, 6:00 PM |
| General Board Meeting | 4th Wednesday, 6:30 PM |

---

## A. Proposed Form Fields

The form is organized into sections that mirror how NYC community board minutes are actually written.

### Section 1 — Meeting Identification

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Committee Name | Select dropdown | Required | Fixed list of 9 options above |
| Meeting Date | Date picker | Required | Cannot be in the future |
| Meeting Location | Text input | Optional | Pre-filled with "127 Pennsylvania Ave, Brooklyn, NY 11207" — editable for off-site meetings |
| Call to Order Time | Time input | Required | e.g. 6:30 PM |
| Adjournment Time | Time input | Optional | e.g. 8:15 PM |

### Section 2 — Attendance

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Chairperson | Text input | Required | Name of the committee chair presiding |
| Members Present | Textarea | Required | Comma-separated list of board members in attendance |
| Members Absent | Textarea | Optional | Comma-separated list |
| Guests / Public Attendees | Textarea | Optional | Names of non-board attendees (elected officials, community members, agency reps) |
| Quorum Reached | Checkbox | Required | Boolean — did the meeting have quorum? |

### Section 3 — Agenda Items

This is a **repeatable group** — the submitter can add 1–20 agenda items.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Item Number | Auto-generated | — | Sequential (1, 2, 3…) |
| Title | Text input | Required | Brief description of the agenda item |
| Discussion Summary | Textarea | Required | What was discussed — key points, presentations, questions |
| Presenter | Text input | Optional | Person who presented or led the item |

### Section 4 — Motions & Votes

This is a **repeatable group** — 0 or more motions per meeting (some meetings have no votes).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Motion Text | Textarea | Required | The resolution or motion as stated |
| Moved By | Text input | Required | Name of the member who made the motion |
| Seconded By | Text input | Required | Name of the member who seconded |
| Votes For | Number input | Required | Count |
| Votes Against | Number input | Required | Count |
| Abstentions | Number input | Required | Count |
| Outcome | Select | Required | "Passed" / "Failed" / "Tabled" |

### Section 5 — Action Items & Next Steps

This is a **repeatable group** — 0 or more items.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Description | Textarea | Required | What needs to be done |
| Assigned To | Text input | Optional | Person or committee responsible |
| Due Date | Date picker | Optional | Target completion date |

### Section 6 — Additional Notes

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Public Comment Summary | Textarea | Optional | Summary of public comments made during the meeting |
| General Notes | Textarea | Optional | Anything not captured above |
| Submitted By | Text input | Required | Name of the person submitting the notes |
| Submitter Email | Email input | Required | For admin follow-up if clarification is needed |

---

## B. Recommended Prisma Model

The main record stores the meeting-level data. Repeatable sections (agenda items, motions, action items) are stored as JSON arrays to keep the schema simple and avoid an explosion of join tables for what is essentially document data.

```prisma
model CommitteeNote {
  id                Int              @id @default(autoincrement())
  committeeName     String           // from fixed dropdown
  meetingDate       DateTime         @db.Date
  meetingLocation   String?
  callToOrderTime   String           // "18:30" format
  adjournmentTime   String?
  chairperson       String
  membersPresent    String           // comma-separated
  membersAbsent     String?
  guests            String?
  quorumReached     Boolean          @default(true)
  agendaItems       Json             // Array of { title, discussionSummary, presenter? }
  motions           Json?            // Array of { motionText, movedBy, secondedBy, votesFor, votesAgainst, abstentions, outcome }
  actionItems       Json?            // Array of { description, assignedTo?, dueDate? }
  publicComment     String?
  generalNotes      String?
  submittedBy       String
  submitterEmail    String
  submissionStatus  SubmissionStatus @default(PENDING)
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  @@index([committeeName])
  @@index([meetingDate])
  @@index([submissionStatus])
  @@map("committee_notes")
}
```

This model reuses the existing `SubmissionStatus` enum (PENDING / APPROVED / REJECTED) so it integrates with the admin approval flow already built.

---

## C. API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/committee-notes` | None (public) | Submit new meeting notes (status = PENDING). Supports multipart/form-data for file attachments. |
| `GET` | `/api/committee-notes` | None | List approved notes; supports `?committee=` and `?limit=` query params |
| `GET` | `/api/committee-notes/:id` | None | Get a single approved note by ID |
| `PUT` | `/api/committee-notes/:id` | None (public) | Edit a note — only allowed when `submissionStatus = PENDING`. Returns 403 if already approved/rejected. |

Admin approval/rejection is handled by the **existing** generic admin endpoints:
- `POST /api/admin/submissions/committeeNote/:id/approve`
- `POST /api/admin/submissions/committeeNote/:id/reject`

No new admin endpoints are needed — the existing `admin.ts` routes already handle any entity with a `submissionStatus` field.

---

## D. Task Breakdown by Team

### Back End (Agent 4) — do first

| # | Task | Files |
|---|------|-------|
| BE-1 | Add `CommitteeNote` model to `schema.prisma` and run migration | `api/prisma/schema.prisma` |
| BE-2 | Create `api/src/routes/committeeNotes.ts` with POST (create) and GET (list + single) endpoints | New file |
| BE-3 | Register the route in `api/src/index.ts` at `/api/committee-notes` | `api/src/index.ts` |
| BE-4 | Add `committeeNote` as a recognized type in `admin.ts` so approval/rejection works | `api/src/routes/admin.ts` |
| BE-5 | Add Swagger annotations to the new route file | `api/src/routes/committeeNotes.ts` |

### Front End (Agent 3) — after BE-1 through BE-3 are done

| # | Task | Files |
|---|------|-------|
| FE-1 | Add "Submit Meeting Notes" button to `CommitteeUpdatesPage.jsx` that navigates to `/committee-updates/submit` | `ui/src/pages/CommitteeUpdatesPage.jsx` |
| FE-2 | Create `CommitteeNotesSubmitPage.jsx` — the multi-section form with validation | New file in `ui/src/pages/` |
| FE-3 | Register the `/committee-updates/submit` route in `App.jsx` | `ui/src/App.jsx` |
| FE-4 | Add `committeeNotesAPI` methods (create, getAll) to `api.ts` / `apiClient.ts` | `ui/src/services/api.ts`, `ui/src/services/apiClient.ts` |
| FE-5 | Wire `CommitteeUpdatesPage.jsx` to display approved notes from the API (replaces hardcoded data) | `ui/src/pages/CommitteeUpdatesPage.jsx` |

**Dependency:** FE-2 through FE-5 depend on the backend endpoints existing. FE-1 (just the button) can be done anytime.

---

## E. Open Questions — RESOLVED (2026-03-25)

> All 5 questions answered by project owner. Decisions below are final.

1. **Committee list maintenance** — **DECIDED: Hardcode the 9 committees** from the CB5 website list (Section A above). No `/api/committees` endpoint needed.

2. **File attachments** — **DECIDED: Yes, support PDF and image uploads** alongside text fields. Backend needs file storage handling (multer + stored path). Frontend needs a file input field in the form that accepts `.pdf`, `.jpg`, `.png`, `.gif`, `.webp`. Files stored alongside the `CommitteeNote` record.

3. **Editing after submission** — **DECIDED: Yes, submitters can edit while status is PENDING.** Backend needs `PUT /api/committee-notes/:id` that only allows updates when `submissionStatus = PENDING`. Frontend needs an edit flow — either a link from a "My Submissions" lookup or an edit token returned on creation.

4. **Display format** — **DECIDED: Show ALL structured fields** (motions, votes, action items, attendance, public comment, etc.) in a format that mimics real CB5 committee meeting notes. Additionally, add an **"AI Summary" section** at the end of each note — a brief plain-language summary auto-generated from the structured data. Research real CB5 meeting note format for styling reference.

5. **Admin notifications** — **DECIDED: Global email notifications to `contact@tjb4nyc.com`.** This is NOT limited to committee notes — it applies to the entire app. The admin must receive an email for ALL admin-relevant actions: new business submissions, new complaints, new events, new committee notes, new photo uploads, approvals, rejections, everything. Backend must implement a **shared notification helper** (`api/src/utils/emailNotifier.ts` or similar) that sends to `contact@tjb4nyc.com` and is called from every relevant route.

---

## F. Additional Implementation Tasks (from resolved questions)

### Back End — New Tasks

| # | Task | Files | Notes |
|---|------|-------|-------|
| BE-6 | Add file attachment support to `CommitteeNote` model — add `attachments` field (JSON array of `{ storedPath, originalName, mimeType, fileSize }`) and handle multipart upload in POST endpoint | `schema.prisma`, `committeeNotes.ts` | Use existing multer config from `middleware/upload.ts` |
| BE-7 | Add `PUT /api/committee-notes/:id` endpoint — only allows updates when `submissionStatus = PENDING`, returns 403 otherwise | `committeeNotes.ts` | Include attachment updates |
| BE-8 | **Build global email notification helper** — Create `api/src/utils/emailNotifier.ts` that sends email to `contact@tjb4nyc.com`. Use `nodemailer` with SMTP config from env vars. Implement `notifyAdmin(subject, body)` function. | New file | Requires `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` env vars |
| BE-9 | **Wire email notifications into all routes** — Call `notifyAdmin()` on: new business submission, new complaint, new event, new photo upload, new committee note, every approval, every rejection | All route files + `admin.ts` | Use consistent subject line format, e.g. "[CB5] New business submission: {name}" |

### Front End — New Tasks

| # | Task | Files | Notes |
|---|------|-------|-------|
| FE-6 | Add file input field to committee notes submission form — accept PDF and images, show preview/filename, send as multipart/form-data | `CommitteeNotesSubmitPage.jsx` | Max file size validation on client |
| FE-7 | Add edit flow for PENDING committee notes — allow submitter to retrieve and edit their submission (via ID or edit token) | New component or page | Only works while status is PENDING |
| FE-8 | Display all structured fields on CommitteeUpdatesPage — show motions/votes, action items, attendance, public comment in a format mimicking real CB5 meeting notes. Add "AI Summary" section at end of each note. | `CommitteeUpdatesPage.jsx` | Research real CB5 format for styling |
