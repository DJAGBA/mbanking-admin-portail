'use client';

import { useState, useCallback } from 'react';
import { getUsers,createUser,updateUser,deleteUser,activateUser,deactivateUser,resetPassword,revokeTokens,} from '@/services/users.service';
import type { UserData, CreateUserRequest, UpdateUserRequest } from '@/src/types/user';
interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
interface UseUsersReturn {
  users: UserData[];
  isFetching: boolean;
  isMutating: boolean;
  error: string | null;
  pagination: PaginationState;
  fetchUsers: (page?: number, limit?: number, search?: string, active?: boolean) => Promise<void>;
  createUser: (data: CreateUserRequest) => Promise<UserData>;
  updateUser: (id: string, data: UpdateUserRequest) => Promise<UserData>;
  activateUser: (id: string) => Promise<UserData>;
  deactivateUser: (id: string) => Promise<UserData>;
  resetPassword: (id: string) => Promise<unknown>;
  deleteUser: (id: string) => Promise<void>;
  revokeToken: (userId: string) => Promise<unknown>;
  clearError: () => void;
}
export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  // ========== FETCH ==========
  const fetchUsers = useCallback(
    async (page = 1, limit = 10, search = '', active?: boolean) => {
      setIsFetching(true);
      setError(null);
      try {
        const response = await getUsers(page, limit, search, active);
        setUsers(response.data.items);
        setPagination({
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        });
      } catch (err: unknown) {
        const error = err as Error;
        const message = error?.message || 'Erreur lors du chargement des utilisateurs';
        setError(message);
        console.error('[useUsers] fetchUsers:', err);
      } finally {
        setIsFetching(false);
      }
    },
    []
  );
  // ========== MUTATIONS ==========
// Mutation helper (tsx-compatible)
async function withMutation<T>(
  fn: () => Promise<T>,
  setIsMutating: (v: boolean) => void,
  setError: (v: string | null) => void
): Promise<T> {
  setIsMutating(true);
  setError(null);
  try {
    return await fn();
  } catch (err: unknown) {
    const error = err as Error;
    const message = error?.message || 'Error during operation';
    setError(message);
    console.error('[useUsers] mutation:', err);
    throw err;
  } finally {
    setIsMutating(false);
  }
}
  const handleCreateUser = useCallback(
    async (userData: CreateUserRequest): Promise<UserData> => {
      const newUser = await withMutation(() => createUser(userData), setIsMutating, setError);
      // Re-fetch to keep data up to date (pagination stays consistent)
      return newUser;
    },
    [setIsMutating, setError]
  );
  const handleUpdateUser = useCallback(
    async (id: string, userData: UpdateUserRequest): Promise<UserData> => {
      const updatedUser = await withMutation(() => updateUser(id, userData), setIsMutating, setError);
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
      return updatedUser;
    },
    [setIsMutating, setError]
  );
  const handleActivateUser = useCallback(
    async (id: string): Promise<UserData> => {
      const updatedUser = await withMutation(() => activateUser(id), setIsMutating, setError);
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
      return updatedUser;
    },
    [setIsMutating, setError]
  );
  const handleDeactivateUser = useCallback(
    async (id: string): Promise<UserData> => {
      const updatedUser = await withMutation(() => deactivateUser(id), setIsMutating, setError);
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
      return updatedUser;
    },
    [setIsMutating, setError]
  );
  const handleResetPassword = useCallback(
    async (id: string) => {
      return withMutation(() => resetPassword(id), setIsMutating, setError);
    },
    [setIsMutating, setError]
  );
  const handleDeleteUser = useCallback(
    async (id: string): Promise<void> => {
      await withMutation(() => deleteUser(id), setIsMutating, setError);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    },
    [setIsMutating, setError]
  );
  const handleRevokeToken = useCallback(
    async (userId: string) => {
      return withMutation(() => revokeTokens(userId), setIsMutating, setError);
    },
    [setIsMutating, setError]
  );
  const clearError = useCallback(() => setError(null), []);
  return {
    users,
    isFetching,
    isMutating,
    error,
    pagination,
    fetchUsers,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    activateUser: handleActivateUser,
    deactivateUser: handleDeactivateUser,
    resetPassword: handleResetPassword,
    deleteUser: handleDeleteUser,
    revokeToken: handleRevokeToken,
    clearError,
  };
}
