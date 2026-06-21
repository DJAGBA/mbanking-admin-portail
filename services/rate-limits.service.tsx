import axios from '@/lib/axios';
import type {AssignPlanRequest,UpdateCustomLimitsRequest,ListRateLimitsResponse,GetRateLimitResponse,RateLimitHistoryResponse,} from '@/src/types/rate-limit';
// GET /rate-limits
export const getRateLimits = async (
  page: number = 1,
  limit: number = 20,
  planName?: string,
  active?: boolean
) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', Math.min(limit, 100).toString());
  if (planName) params.append('planName', planName);
  if (active !== undefined) params.append('active', active.toString());
  const response = await axios.get<ListRateLimitsResponse>(
    `/rate-limits?${params.toString()}`
  );
  return response.data;
};
// GET /rate-limits/users/:userId
export const getRateLimitByUser = async (userId: string) => {
  const response = await axios.get<GetRateLimitResponse>(`/rate-limits/users/${userId}`);
  return response.data.data;
};
// POST /rate-limits/users/:userId/assign
export const assignPlan = async (userId: string, data: AssignPlanRequest) => {
  const response = await axios.post<GetRateLimitResponse>(`/rate-limits/users/${userId}/assign`, data);
  return response.data.data;
};
// PATCH /rate-limits/users/:userId/custom-limits
export const updateCustomLimits = async (
  userId: string,
  data: UpdateCustomLimitsRequest
) => {
  const response = await axios.patch<GetRateLimitResponse>(
    `/rate-limits/users/${userId}/custom-limits`, data
  );
  return response.data.data;
};
// DELETE /rate-limits/users/:userId
export const deactivateUserPlan = async (userId: string) => {
  const response = await axios.delete(`/rate-limits/users/${userId}`);
  return response.data;
};
// GET /rate-limits/users/:userId/history
export const getRateLimitHistory = async (
  userId: string,
  page: number = 1,
  limit: number = 20,
  action?: string,
  dateFrom?: string,
  dateTo?: string,
) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', Math.min(limit, 100).toString());
  if (action) params.append('action', action);
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);

  const response = await axios.get<RateLimitHistoryResponse>(
    `/rate-limits/users/${userId}/history?${params.toString()}`
  );
  return response.data;
};
