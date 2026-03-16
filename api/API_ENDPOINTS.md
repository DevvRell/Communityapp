# API Endpoints Documentation

This document describes all available API endpoints for the CB5 Backend API.

## Base URL

- Development: `http://localhost:3000`
- API Base: `http://localhost:3000/api`

## Swagger Documentation

Interactive API documentation is available at: `http://localhost:3000/api-docs`

## Endpoints

### Businesses

#### GET `/api/businesses`
Get all businesses with optional category filter.

**Query Parameters:**
- `category` (optional): Filter by category (e.g., "Food & Beverage")

**Response:** Array of business objects

**Example:**
```bash
GET /api/businesses
GET /api/businesses?category=Food%20%26%20Beverage
```

#### GET `/api/businesses/search?q={query}`
Search businesses by name or description.

**Query Parameters:**
- `q` (required): Search query

**Response:** Array of matching business objects

**Example:**
```bash
GET /api/businesses/search?q=coffee
```

#### GET `/api/businesses/:id`
Get a specific business by ID.

**Response:** Business object

**Example:**
```bash
GET /api/businesses/1
```

#### POST `/api/businesses`
Create a new business.

**Request Body:**
```json
{
  "name": "Business Name",
  "category": "Food & Beverage",
  "description": "Business description",
  "address": "123 Main St",
  "phone": "(555) 123-4567",
  "email": "contact@business.com",
  "rating": 4.5,
  "reviews": 100,
  "hours": "Mon-Fri: 9AM-5PM"
}
```

**Response:** Created business object (201)

#### PUT `/api/businesses/:id`
Update an existing business.

**Request Body:** Same as POST (all fields optional)

**Response:** Updated business object

#### DELETE `/api/businesses/:id`
Delete a business.

**Response:** Success message

---

### Complaints

#### GET `/api/complaints`
Get all complaints with optional status filter.

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `in-progress`, `resolved`, or `all`)

**Response:** Array of complaint objects

**Example:**
```bash
GET /api/complaints
GET /api/complaints?status=pending
```

#### GET `/api/complaints/:id`
Get a specific complaint by ID.

**Response:** Complaint object

#### POST `/api/complaints`
Create a new complaint.

**Request Body:**
```json
{
  "title": "Complaint Title",
  "description": "Detailed description",
  "category": "Infrastructure",
  "location": "123 Main St",
  "status": "pending",
  "priority": "high",
  "submittedBy": "John Doe"
}
```

**Status values:** `pending`, `in-progress`, `resolved`  
**Priority values:** `low`, `medium`, `high`

**Response:** Created complaint object (201)

#### PATCH `/api/complaints/:id/status`
Update complaint status.

**Request Body:**
```json
{
  "status": "in-progress"
}
```

**Response:** Updated complaint object

**Note:** Setting status to `resolved` automatically sets `resolvedDate`.

#### POST `/api/complaints/:id/response`
Add a response to a complaint.

**Request Body:**
```json
{
  "response": "We have reviewed your complaint and will address it soon."
}
```

**Response:** Updated complaint object

---

### Events

#### GET `/api/events`
Get all events with optional category filter.

**Query Parameters:**
- `category` (optional): Filter by category (e.g., "Community Service")

**Response:** Array of event objects

**Example:**
```bash
GET /api/events
GET /api/events?category=Community%20Service
```

#### GET `/api/events/upcoming`
Get upcoming events (events with date >= today).

**Response:** Array of upcoming event objects (limited to 10)

#### GET `/api/events/:id`
Get a specific event by ID.

**Response:** Event object

#### POST `/api/events`
Create a new event.

**Request Body:**
```json
{
  "title": "Event Title",
  "category": "Community Service",
  "description": "Event description",
  "date": "2024-02-15",
  "time": "09:00 AM - 12:00 PM",
  "location": "Central Park",
  "organizer": "Neighborhood Association",
  "attendees": 0,
  "maxAttendees": 100,
  "image": "https://example.com/image.jpg"
}
```

**Response:** Created event object (201)

#### POST `/api/events/:id/attend`
Register attendance for an event (increments attendee count).

**Request Body:**
```json
{
  "userId": "user123"
}
```

**Response:** Updated event object

**Error:** Returns 400 if event is full

---

## Data Format Notes

### Business
- `rating`: Decimal number (0-5 scale, 2 decimal places)
- `reviews`: Integer count

### Complaint
- `status`: Enum converted to lowercase with hyphens for UI (`pending`, `in-progress`, `resolved`)
- `priority`: Enum converted to lowercase (`low`, `medium`, `high`)
- `submittedDate`: ISO date string (YYYY-MM-DD)
- `resolvedDate`: ISO date string or null

### Event
- `date`: ISO date string (YYYY-MM-DD)
- `attendees`: Current count (auto-incremented on attend)
- `maxAttendees`: Maximum capacity

## Error Responses

All endpoints return standard HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (missing/invalid data)
- `404`: Not Found
- `500`: Internal Server Error

Error response format:
```json
{
  "error": "Error message"
}
```

## CORS

CORS is enabled for all origins in development. The API accepts requests from any origin.

## Testing

You can test all endpoints using:
1. **Swagger UI**: `http://localhost:3000/api-docs`
2. **curl**: Command-line tool
3. **Postman**: API testing tool
4. **Frontend**: The UI is configured to use these endpoints

## Example Requests

### Create a Business
```bash
curl -X POST http://localhost:3000/api/businesses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Coffee Shop",
    "category": "Food & Beverage",
    "description": "A test coffee shop",
    "address": "123 Test St",
    "phone": "(555) 123-4567",
    "email": "test@example.com",
    "hours": "Mon-Fri: 8AM-6PM"
  }'
```

### Create a Complaint
```bash
curl -X POST http://localhost:3000/api/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Broken Street Light",
    "description": "Street light is out",
    "category": "Infrastructure",
    "location": "Main St",
    "priority": "high",
    "submittedBy": "John Doe"
  }'
```

### Create an Event
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Community Cleanup",
    "category": "Community Service",
    "description": "Monthly cleanup event",
    "date": "2024-03-15",
    "time": "09:00 AM - 12:00 PM",
    "location": "Central Park",
    "organizer": "Neighborhood Association",
    "maxAttendees": 50
  }'
```
