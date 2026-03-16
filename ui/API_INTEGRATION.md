# API Integration Guide

This guide explains how to use the standardized TypeScript API client to interact with the CB5 Backend API.

## Quick Start

### 1. Install Dependencies

```bash
cd ui
npm install
```

This will install TypeScript and all required dependencies.

### 2. Configure API URL

Create a `.env` file in the `ui` directory:

```bash
# For staging (default)
VITE_API_URL=https://cb5-api.onrender.com

# For local development
# VITE_API_URL=http://localhost:3000
```

### 3. Use in Components

#### Option A: Direct API Calls

```typescript
import { businessAPI } from '@/services/api';

async function loadBusinesses() {
  try {
    const businesses = await businessAPI.getAll();
    console.log(businesses);
  } catch (error) {
    console.error('Failed to load businesses:', error);
  }
}
```

#### Option B: React Hooks (Recommended)

```typescript
import { useBusinesses, useCreateBusiness } from '@/services/apiClient';

function BusinessList() {
  const { data: businesses, loading, error, refetch } = useBusinesses();
  const { mutate: createBusiness } = useCreateBusiness();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {businesses?.map(business => (
        <div key={business.id}>{business.name}</div>
      ))}
    </div>
  );
}
```

## Available API Methods

### Businesses

```typescript
import { businessAPI } from '@/services/api';

// Get all businesses
const businesses = await businessAPI.getAll();

// Get businesses by category
const restaurants = await businessAPI.getAll({ category: 'restaurant' });

// Get business by ID
const business = await businessAPI.getById(1);

// Search businesses
const results = await businessAPI.search('coffee');

// Create business
const newBusiness = await businessAPI.create({
  name: 'My Business',
  category: 'restaurant',
  description: 'A great place',
  address: '123 Main St',
  phone: '555-0100',
  email: 'contact@business.com',
});

// Update business
const updated = await businessAPI.update(1, {
  name: 'Updated Name',
  rating: 4.5,
});

// Delete business
await businessAPI.delete(1);
```

### Complaints

```typescript
import { complaintAPI } from '@/services/api';

// Get all complaints
const complaints = await complaintAPI.getAll();

// Get complaints by status
const pending = await complaintAPI.getAll({ status: 'pending' });

// Get complaint by ID
const complaint = await complaintAPI.getById(1);

// Create complaint
const newComplaint = await complaintAPI.create({
  title: 'Broken Street Light',
  description: 'The light on Main St is broken',
  category: 'infrastructure',
  location: 'Main St and 5th Ave',
  submittedBy: 'John Doe',
  priority: 'high',
});

// Update status
const updated = await complaintAPI.updateStatus(1, {
  status: 'in-progress',
});

// Add response
await complaintAPI.addResponse(1, {
  response: 'We are looking into this issue.',
});
```

### Events

```typescript
import { eventAPI } from '@/services/api';

// Get all events
const events = await eventAPI.getAll();

// Get events by category
const communityEvents = await eventAPI.getAll({ category: 'community' });

// Get upcoming events
const upcoming = await eventAPI.getUpcoming();

// Get event by ID
const event = await eventAPI.getById(1);

// Create event
const newEvent = await eventAPI.create({
  title: 'Community Cleanup',
  category: 'community',
  description: 'Join us for cleanup day',
  date: '2026-02-15',
  time: '09:00',
  location: 'Central Park',
  organizer: 'Community Association',
  maxAttendees: 100,
});

// Register attendance
await eventAPI.attend(1, { userId: 'user-123' });
```

## React Hooks

### Business Hooks

```typescript
import {
  useBusinesses,
  useBusiness,
  useSearchBusinesses,
  useCreateBusiness,
  useUpdateBusiness,
  useDeleteBusiness,
} from '@/services/apiClient';

// Get all businesses
const { data, loading, error, refetch } = useBusinesses();

// Get businesses by category
const { data: restaurants } = useBusinesses('restaurant');

// Get single business
const { data: business } = useBusiness(1);

// Search
const { data: results } = useSearchBusinesses('coffee');

// Mutations
const { mutate: createBusiness, loading: creating } = useCreateBusiness();
const { mutate: updateBusiness } = useUpdateBusiness();
const { mutate: deleteBusiness } = useDeleteBusiness();
```

### Complaint Hooks

```typescript
import {
  useComplaints,
  useComplaint,
  useCreateComplaint,
  useUpdateComplaintStatus,
  useAddComplaintResponse,
} from '@/services/apiClient';

// Get all complaints
const { data: complaints } = useComplaints();

// Get by status
const { data: pending } = useComplaints('pending');

// Get single complaint
const { data: complaint } = useComplaint(1);

// Mutations
const { mutate: createComplaint } = useCreateComplaint();
const { mutate: updateStatus } = useUpdateComplaintStatus();
const { mutate: addResponse } = useAddComplaintResponse();
```

### Event Hooks

```typescript
import {
  useEvents,
  useEvent,
  useUpcomingEvents,
  useCreateEvent,
  useAttendEvent,
} from '@/services/apiClient';

// Get all events
const { data: events } = useEvents();

// Get by category
const { data: communityEvents } = useEvents('community');

// Get upcoming
const { data: upcoming } = useUpcomingEvents();

// Get single event
const { data: event } = useEvent(1);

// Mutations
const { mutate: createEvent } = useCreateEvent();
const { mutate: attendEvent } = useAttendEvent();
```

## Error Handling

All API methods and hooks handle errors gracefully:

```typescript
import { ApiClientError } from '@/services/api';

try {
  const business = await businessAPI.getById(999);
} catch (error) {
  if (error instanceof ApiClientError) {
    if (error.statusCode === 404) {
      console.log('Business not found');
    } else if (error.statusCode === 500) {
      console.error('Server error');
    } else {
      console.error('API Error:', error.message);
    }
  }
}
```

With hooks, errors are automatically captured:

```typescript
const { data, loading, error } = useBusiness(1);

if (error) {
  return <div>Error: {error}</div>;
}
```

## TypeScript Types

All types are available for import:

```typescript
import type {
  Business,
  Complaint,
  Event,
  CreateBusinessRequest,
  CreateComplaintRequest,
  CreateEventRequest,
  ComplaintStatus,
  ComplaintPriority,
} from '@/types/api';

function MyComponent() {
  const [business, setBusiness] = useState<Business | null>(null);
  // ...
}
```

## Migration from Old API

If you're using the old `api.js` file, here's how to migrate:

### Before (JavaScript)
```javascript
import { businessAPI } from './services/api.js';

const businesses = await businessAPI.getAll();
```

### After (TypeScript)
```typescript
import { businessAPI } from '@/services/api';

const businesses = await businessAPI.getAll();
```

The API methods are the same, but now you get:
- ✅ Full TypeScript type safety
- ✅ Better error handling
- ✅ React hooks for easier component integration
- ✅ Auto-completion in your IDE

## Next Steps

1. Update your components to use the new API client
2. Replace mock data with real API calls
3. Add proper error handling and loading states
4. Test with the staging API: `https://cb5-api.onrender.com`

For more details, see:
- `src/services/README.md` - Detailed API documentation
- `src/types/api.ts` - All type definitions
- `src/services/api.ts` - Core API client implementation
