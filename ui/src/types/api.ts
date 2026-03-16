/**
 * API Type Definitions
 * These types match the backend API responses and requests
 */

// ============================================================================
// Business Types
// ============================================================================

export interface Business {
  id: number;
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  reviews: number;
  hours: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessRequest {
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  rating?: number;
  reviews?: number;
  hours?: string;
}

export interface UpdateBusinessRequest extends Partial<CreateBusinessRequest> {}

// ============================================================================
// Complaint Types
// ============================================================================

export type ComplaintStatus = 'pending' | 'in-progress' | 'resolved';
export type ComplaintPriority = 'low' | 'medium' | 'high';

export interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  submittedBy: string;
  submittedDate: string;
  resolvedDate: string | null;
  response: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintRequest {
  title: string;
  description: string;
  category: string;
  location: string;
  submittedBy: string;
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
}

export interface UpdateComplaintStatusRequest {
  status: ComplaintStatus;
}

export interface AddComplaintResponseRequest {
  response: string;
}

// ============================================================================
// Event Types
// ============================================================================

export interface Event {
  id: number;
  title: string;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD format
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  maxAttendees: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD format
  time: string;
  location: string;
  organizer: string;
  maxAttendees: number;
  attendees?: number;
  image?: string;
}

export interface AttendEventRequest {
  userId?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

// ============================================================================
// Health Check Types
// ============================================================================

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    api: string;
    database: string;
    prisma?: string;
  };
  error?: string;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface BusinessQueryParams {
  category?: string;
}

export interface ComplaintQueryParams {
  status?: ComplaintStatus | 'all';
}

export interface EventQueryParams {
  category?: string;
}
