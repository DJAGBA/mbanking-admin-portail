import axios from '@/lib/axios';
import { APIResponse } from '@/src/types/ApiResponse';
import type {AssignPlanRequest,UpdateCustomLimitsRequest,ListRateLimitsResponse,GetRateLimitResponse,RateLimitHistoryResponse, RateLimit,} from '@/src/types/rate-limit';
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
export const getRateLimitByUser = async (userId: string): Promise<GetRateLimitResponse> => {
  const response = await axios.get(`/rate-limits/users/${userId}`);
  return response.data ;
};
// POST /rate-limits/users/:userId/assign
export const assignPlan = async (userId: string, data: AssignPlanRequest): Promise<GetRateLimitResponse> => {
  const response = await axios.post(`/rate-limits/users/${userId}/assign`, data);
  return response.data ;
};
// PATCH /rate-limits/users/:userId/custom-limits
export const updateCustomLimits = async (
  userId: string,
  data: UpdateCustomLimitsRequest
): Promise<GetRateLimitResponse> => {
  const response = await axios.patch(
    `/rate-limits/users/${userId}/custom-limits`, data
  );
  return response.data as GetRateLimitResponse ;
};
// DELETE /rate-limits/users/:userId
export const deactivateUserPlan = async (userId: string): Promise<APIResponse<GetRateLimitResponse>> => {
  const response = await axios.delete(`/rate-limits/users/${userId}`);
  return response.data as APIResponse<GetRateLimitResponse>;
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
