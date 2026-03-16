/**
 * Standardized API Client
 * Provides type-safe methods for interacting with the CB5 Backend API
 */

import type {
  Business,
  CreateBusinessRequest,
  UpdateBusinessRequest,
  Complaint,
  CreateComplaintRequest,
  UpdateComplaintStatusRequest,
  AddComplaintResponseRequest,
  Event,
  CreateEventRequest,
  AttendEventRequest,
  HealthCheckResponse,
  BusinessQueryParams,
  ComplaintQueryParams,
  EventQueryParams,
} from '../types/api';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Remove trailing slash
const BASE_URL = API_BASE_URL.replace(/\/$/, '');

// ============================================================================
// Error Handling
// ============================================================================

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Handles API response and throws appropriate errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  let data: any;
  try {
    data = isJson ? await response.json() : await response.text();
  } catch (error) {
    throw new ApiClientError(
      `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      response.status
    );
  }

  if (!response.ok) {
    const errorMessage =
      (isJson && data.error) || data.message || data || `HTTP ${response.status}: ${response.statusText}`;
    throw new ApiClientError(errorMessage, response.status, data);
  }

  return data as T;
}

/**
 * Generic API request function
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

/**
 * Build query string from parameters
 */
function buildQueryString(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ============================================================================
// Business API
// ============================================================================

export const businessAPI = {
  /**
   * Get all businesses
   * @param params Optional query parameters (category filter)
   */
  getAll: async (params?: BusinessQueryParams): Promise<Business[]> => {
    const query = params ? buildQueryString(params as Record<string, string>) : '';
    return apiRequest<Business[]>(`/api/businesses${query}`);
  },

  /**
   * Get business by ID
   */
  getById: async (id: number): Promise<Business> => {
    return apiRequest<Business>(`/api/businesses/${id}`);
  },

  /**
   * Search businesses
   */
  search: async (query: string): Promise<Business[]> => {
    return apiRequest<Business[]>(`/api/businesses/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Create a new business
   */
  create: async (data: CreateBusinessRequest): Promise<Business> => {
    return apiRequest<Business>('/api/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a business
   */
  update: async (id: number, data: UpdateBusinessRequest): Promise<Business> => {
    return apiRequest<Business>(`/api/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a business
   */
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/api/businesses/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Complaint API
// ============================================================================

export const complaintAPI = {
  /**
   * Get all complaints
   * @param params Optional query parameters (status filter)
   */
  getAll: async (params?: ComplaintQueryParams): Promise<Complaint[]> => {
    const query = params ? buildQueryString(params as Record<string, string>) : '';
    return apiRequest<Complaint[]>(`/api/complaints${query}`);
  },

  /**
   * Get complaint by ID
   */
  getById: async (id: number): Promise<Complaint> => {
    return apiRequest<Complaint>(`/api/complaints/${id}`);
  },

  /**
   * Create a new complaint
   */
  create: async (data: CreateComplaintRequest): Promise<Complaint> => {
    return apiRequest<Complaint>('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update complaint status
   */
  updateStatus: async (id: number, data: UpdateComplaintStatusRequest): Promise<Complaint> => {
    return apiRequest<Complaint>(`/api/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Add response to a complaint
   */
  addResponse: async (id: number, data: AddComplaintResponseRequest): Promise<Complaint> => {
    return apiRequest<Complaint>(`/api/complaints/${id}/response`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// Event API
// ============================================================================

export const eventAPI = {
  /**
   * Get all events
   * @param params Optional query parameters (category filter)
   */
  getAll: async (params?: EventQueryParams): Promise<Event[]> => {
    const query = params ? buildQueryString(params as Record<string, string>) : '';
    return apiRequest<Event[]>(`/api/events${query}`);
  },

  /**
   * Get event by ID
   */
  getById: async (id: number): Promise<Event> => {
    return apiRequest<Event>(`/api/events/${id}`);
  },

  /**
   * Get upcoming events
   */
  getUpcoming: async (): Promise<Event[]> => {
    return apiRequest<Event[]>('/api/events/upcoming');
  },

  /**
   * Create a new event
   */
  create: async (data: CreateEventRequest): Promise<Event> => {
    return apiRequest<Event>('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Register attendance for an event
   */
  attend: async (id: number, data?: AttendEventRequest): Promise<Event> => {
    return apiRequest<Event>(`/api/events/${id}/attend`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },
};

// ============================================================================
// Admin API
// ============================================================================

const ADMIN_KEY = () => import.meta.env.VITE_ADMIN_API_KEY || '';

export const adminAPI = {
  getSubmissions: async (type?: string, status?: string): Promise<{ submissions: any[] }> => {
    const query = buildQueryString({
      type: type && type !== 'all' ? type : undefined,
      status: status || 'pending',
    });
    return apiRequest(`/api/admin/submissions${query}`, {
      headers: { 'X-Admin-Key': ADMIN_KEY() },
    });
  },

  approve: async (type: string, id: number): Promise<any> => {
    return apiRequest(`/api/admin/submissions/${type}/${id}/approve`, {
      method: 'POST',
      headers: { 'X-Admin-Key': ADMIN_KEY() },
    });
  },

  reject: async (type: string, id: number): Promise<any> => {
    return apiRequest(`/api/admin/submissions/${type}/${id}/reject`, {
      method: 'POST',
      headers: { 'X-Admin-Key': ADMIN_KEY() },
    });
  },
};

// ============================================================================
// Health Check API
// ============================================================================

export const healthAPI = {
  /**
   * Check API health status
   */
  check: async (): Promise<HealthCheckResponse> => {
    return apiRequest<HealthCheckResponse>('/health');
  },
};

// ============================================================================
// Default Export
// ============================================================================

export default {
  business: businessAPI,
  complaint: complaintAPI,
  event: eventAPI,
  health: healthAPI,
  admin: adminAPI,
};
