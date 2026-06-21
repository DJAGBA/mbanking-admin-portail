'use client';
import { useState, useCallback } from 'react';
import {getPlans,getPlanById,createPlan,updatePlan,} from '@/services/plans.service';
import type { Plan, CreatePlanRequest, UpdatePlanRequest } from '@/src/types/plan';
interface PaginationState { page: number;limit: number;total: number;totalPages: number;}
interface UsePlansReturn {
  plans: Plan[];
  selectedPlan: Plan | null;
  isFetching: boolean;
  isMutating: boolean;
  error: string | null;
  pagination: PaginationState;
  fetchPlans: (page?: number, limit?: number, active?: boolean) => Promise<void>;
  fetchPlanById: (id: string) => Promise<Plan | null>;
  createPlan: (data: CreatePlanRequest) => Promise<Plan>;
  updatePlan: (id: string, data: UpdatePlanRequest) => Promise<Plan>;
  selectPlan: (plan: Plan | null) => void;
  clearError: () => void;
}
export function usePlans(): UsePlansReturn {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  // Mutation helper
 const withMutation = useCallback(
  async <T,>(fn: () => Promise<T>): Promise<T> => {
    setIsMutating(true);
    setError(null);
    try {
      return await fn();
    } catch (err: unknown) {
      const error = err as Error;
      const message = error?.message || "Error during operation";
      setError(message);
      throw err;
    } finally {
      setIsMutating(false);
    }
  },
  []
);
  // Fetch list
  const fetchPlans = useCallback(
    async (page = 1, limit = 20, active?: boolean) => {
      setIsFetching(true);
      setError(null);
      try {
        const response = await getPlans(page, limit, active);
        if (response?.data?.items) {
          setPlans(response.data.items);
          setPagination({
            page: response.data.pagination?.page || page,
            limit: response.data.pagination?.limit || limit,
            total: response.data.pagination?.total || 0,
            totalPages: response.data.pagination?.totalPages || 0,
          });
        }
      } catch (err: unknown) {
        const error = err as Error;
        setError(error?.message || 'Error while loading');
      } finally {
        setIsFetching(false);
      }
    },
    []
  );
  // Fetch by ID
  const fetchPlanById = useCallback(
    async (id: string): Promise<Plan | null> => {
      setIsFetching(true);
      setError(null);
      try {
        const plan = await getPlanById(id);
        return plan;
      } catch (err: unknown) {
        const error = err as Error;
        setError(error?.message || 'Plan not found');
        return null;
      } finally {
        setIsFetching(false);
      }
    },
    []
  );
  // Create
  const handleCreatePlan = useCallback(
    async (data: CreatePlanRequest): Promise<Plan> => {
      return withMutation(() => createPlan(data));
    },
    [withMutation]
  );
  // Update
  const handleUpdatePlan = useCallback(
    async (id: string, data: UpdatePlanRequest): Promise<Plan> => {
      const updated = await withMutation(() => updatePlan(id, data));
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      return updated;
    },
    [withMutation]
  );
  // Select
  const selectPlan = useCallback((plan: Plan | null) => {
    setSelectedPlan(plan);
  }, []);
  // Clear error
  const clearError = useCallback(() => setError(null), []);
  return { plans,selectedPlan,isFetching,isMutating,error,pagination,fetchPlans,fetchPlanById,createPlan: handleCreatePlan,updatePlan: handleUpdatePlan,selectPlan,clearError,
  };
}