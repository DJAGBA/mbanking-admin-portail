'use client';

import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/services/users.service';
import type { ListUsersResponse } from '@/src/types/user';
interface UseUsersQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  enabled?: boolean;
  useMockOnError?: boolean;
}
const MOCK_DATA: ListUsersResponse = {
  status: { code: 200, message: "Success" },
  data: {
    items: [
      {
        id: "1",
        username: "john_doe",
        name: "John Doe",
        email: "john@example.com",
        active: true,
        createdAt: "2026-05-15T10:30:00.000Z",
        updatedAt: "2026-06-03T14:00:00.000Z",
      },
      {
        id: "2",
        username: "jane_smith",
        name: "Jane Smith",
        email: "jane@example.com",
        active: true,
        createdAt: "2026-05-20T08:15:00.000Z",
        updatedAt: "2026-06-02T09:30:00.000Z",
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  },
};
export function useUsersQuery(options: UseUsersQueryOptions = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    active,
    enabled = true,
    useMockOnError = false,
  } = options;
  const validatedPage = Math.max(1, page);
  const validatedLimit = Math.min(Math.max(1, limit), 100);
  const queryKey = ['users', { page: validatedPage, limit: validatedLimit, search, active }];
  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<ListUsersResponse> => {
      if (useMockOnError) {
        try {
          return await getUsers(validatedPage, validatedLimit, search, active);
        } catch (error) {
          console.warn('[useUsersQuery] Fallback to mock data:', error);
          return MOCK_DATA;
        }
      }
      return getUsers(validatedPage, validatedLimit, search, active);
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    users: query.data?.data?.items ?? [],
    pagination: query.data?.data?.pagination ?? {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isUsingMockData: useMockOnError && query.data === MOCK_DATA,
    error: query.error,
    refetch: query.refetch,
  };
}