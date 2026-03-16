# API Client Documentation

This directory contains the standardized API client for interacting with the CB5 Backend API.

## Structure

- `api.ts` - Core API client with type-safe methods
- `apiClient.ts` - React hooks for using the API in components
- `../types/api.ts` - TypeScript type definitions

## Usage

### Direct API Calls

```typescript
import { businessAPI, complaintAPI, eventAPI } from '@/services/api';

// Get all businesses
const businesses = await businessAPI.getAll();

// Get businesses by category
const restaurants = await businessAPI.getAll({ category: 'restaurant' });

// Create a business
const newBusiness = await businessAPI.create({
  name: 'My Business',
  category: 'restaurant',
  description: 'A great place',
  address: '123 Main St',
  phone: '555-0100',
  email: 'contact@business.com',
});

// Error handling
try {
  const business = await businessAPI.getById(1);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.statusCode);
  }
}
```

### React Hooks

```typescript
import { useBusinesses, useCreateBusiness } from '@/services/apiClient';

function BusinessList() {
  const { data: businesses, loading, error, refetch } = useBusinesses();
  const { mutate: createBusiness, loading: creating } = useCreateBusiness();

  const handleCreate = async () => {
    const result = await createBusiness({
      name: 'New Business',
      category: 'restaurant',
      // ... other fields
    });
    
    if (result) {
      refetch(); // Refresh the list
    }
  };

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

## Available Hooks

### Businesses
- `useBusinesses(category?)` - Get all businesses
- `useBusiness(id)` - Get business by ID
- `useSearchBusinesses(query)` - Search businesses
- `useCreateBusiness()` - Create business mutation
- `useUpdateBusiness()` - Update business mutation
- `useDeleteBusiness()` - Delete business mutation

### Complaints
- `useComplaints(status?)` - Get all complaints
- `useComplaint(id)` - Get complaint by ID
- `useCreateComplaint()` - Create complaint mutation
- `useUpdateComplaintStatus()` - Update status mutation
- `useAddComplaintResponse()` - Add response mutation

### Events
- `useEvents(category?)` - Get all events
- `useEvent(id)` - Get event by ID
- `useUpcomingEvents()` - Get upcoming events
- `useCreateEvent()` - Create event mutation
- `useAttendEvent()` - Register attendance mutation

## Configuration

Set the `VITE_API_URL` environment variable:

```bash
# .env
VITE_API_URL=https://cb5-api.onrender.com
```

Default is `https://cb5-api.onrender.com` (staging).

## Error Handling

All API methods throw `ApiClientError` instances with:
- `message` - Error message
- `statusCode` - HTTP status code
- `response` - Full response object (if available)

```typescript
import { ApiClientError } from '@/services/api';

try {
  await businessAPI.getById(999);
} catch (error) {
  if (error instanceof ApiClientError) {
    if (error.statusCode === 404) {
      console.log('Business not found');
    } else {
      console.error('API Error:', error.message);
    }
  }
}
```
