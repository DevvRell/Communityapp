/**
 * API Client Utilities
 * Helper functions and hooks for using the API in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { businessAPI, complaintAPI, eventAPI, healthAPI, ApiClientError } from './api';
import type {
  Business,
  Complaint,
  Event,
  CreateBusinessRequest,
  CreateComplaintRequest,
  CreateEventRequest,
  UpdateBusinessRequest,
  UpdateComplaintStatusRequest,
  AddComplaintResponseRequest,
} from '../types/api';

// ============================================================================
// Generic Hook Types
// ============================================================================

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
}

interface UseMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | undefined>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

// ============================================================================
// Generic API Hooks
// ============================================================================

/**
 * Generic hook for fetching data
 */
function useApi<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof ApiClientError
          ? error.message
          : error instanceof Error
          ? error.message
          : 'An unknown error occurred';
      setState({ data: null, loading: false, error: errorMessage });
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

/**
 * Generic hook for mutations (create, update, delete)
 */
function useMutation<TData, TVariables>(
  mutateFn: (variables: TVariables) => Promise<TData>
): UseMutationReturn<TData, TVariables> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | undefined> => {
      setLoading(true);
      setError(null);
      try {
        const data = await mutateFn(variables);
        setLoading(false);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof ApiClientError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'An unknown error occurred';
        setError(errorMessage);
        setLoading(false);
        return undefined;
      }
    },
    [mutateFn]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, reset };
}

// ============================================================================
// Business Hooks
// ============================================================================

export function useBusinesses(category?: string) {
  return useApi(
    () => businessAPI.getAll(category ? { category } : undefined),
    [category]
  );
}

export function useBusiness(id: number) {
  return useApi(() => businessAPI.getById(id), [id]);
}

export function useSearchBusinesses(query: string) {
  return useApi(
    () => {
      if (!query || query.trim().length === 0) {
        // Return empty array if no query, don't call API
        return Promise.resolve([]);
      }
      return businessAPI.search(query);
    },
    [query]
  );
}

export function useCreateBusiness() {
  return useMutation<Business, CreateBusinessRequest>(businessAPI.create);
}

export function useUpdateBusiness() {
  return useMutation<Business, { id: number; data: UpdateBusinessRequest }>(
    ({ id, data }) => businessAPI.update(id, data)
  );
}

export function useDeleteBusiness() {
  return useMutation<void, number>(businessAPI.delete);
}

// ============================================================================
// Complaint Hooks
// ============================================================================

export function useComplaints(status?: string) {
  return useApi(
    () => complaintAPI.getAll(status && status !== 'all' ? { status: status as any } : undefined),
    [status]
  );
}

export function useComplaint(id: number) {
  return useApi(() => complaintAPI.getById(id), [id]);
}

export function useCreateComplaint() {
  return useMutation<Complaint, CreateComplaintRequest>(complaintAPI.create);
}

export function useUpdateComplaintStatus() {
  return useMutation<Complaint, { id: number; data: UpdateComplaintStatusRequest }>(
    ({ id, data }) => complaintAPI.updateStatus(id, data)
  );
}

export function useAddComplaintResponse() {
  return useMutation<Complaint, { id: number; data: AddComplaintResponseRequest }>(
    ({ id, data }) => complaintAPI.addResponse(id, data)
  );
}

// ============================================================================
// Event Hooks
// ============================================================================

export function useEvents(category?: string) {
  return useApi(
    () => eventAPI.getAll(category ? { category } : undefined),
    [category]
  );
}

export function useEvent(id: number) {
  return useApi(() => eventAPI.getById(id), [id]);
}

export function useUpcomingEvents() {
  return useApi(() => eventAPI.getUpcoming(), []);
}

export function useCreateEvent() {
  return useMutation<Event, CreateEventRequest>(eventAPI.create);
}

export function useAttendEvent() {
  return useMutation<Event, { id: number; userId?: string }>(
    ({ id, userId }) => eventAPI.attend(id, userId ? { userId } : undefined)
  );
}

// ============================================================================
// Health Check Hook
// ============================================================================

export function useHealthCheck() {
  return useApi(() => healthAPI.check(), []);
}
