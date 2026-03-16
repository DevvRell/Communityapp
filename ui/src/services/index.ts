/**
 * API Services - Main Export
 * 
 * This file provides a single entry point for all API-related exports
 */

// Core API client
export {
  businessAPI,
  complaintAPI,
  eventAPI,
  healthAPI,
  ApiClientError,
  default as api,
} from './api';

// React hooks
export {
  useBusinesses,
  useBusiness,
  useSearchBusinesses,
  useCreateBusiness,
  useUpdateBusiness,
  useDeleteBusiness,
  useComplaints,
  useComplaint,
  useCreateComplaint,
  useUpdateComplaintStatus,
  useAddComplaintResponse,
  useEvents,
  useEvent,
  useUpcomingEvents,
  useCreateEvent,
  useAttendEvent,
  useHealthCheck,
} from './apiClient';

// Types
export type * from '../types/api';
