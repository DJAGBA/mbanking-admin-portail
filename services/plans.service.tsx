import axios from '@/lib/axios';
import type { Plan,CreatePlanRequest,UpdatePlanRequest,ListPlansResponse,GetPlanResponse,} from '@/src/types/plan';
import {APIResponse} from "@/src/types/ApiResponse";
// GET /plans
export const getPlans = async (
  page: number = 1,
  limit: number = 20,
  active?: boolean
) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', Math.min(limit, 100).toString());
  if (active !== undefined) params.append('active', active.toString());

  const response = await axios.get<ListPlansResponse>(`/plans?${params.toString()}`);
  return response.data;
};

// GET /plans/:id
export const getPlanById = async (id: string): Promise<APIResponse<Plan>> => {
  const response = await axios.get<GetPlanResponse>(`/plans/${id}`);
  return response.data as APIResponse<Plan>;
};

// POST /plans
export const createPlan = async (data: CreatePlanRequest):Promise<APIResponse<Plan>> => {
  const response = await axios.post<GetPlanResponse>('/plans', data);
  return response.data as APIResponse<Plan>;
};

// PUT /plans/:id
export const updatePlan = async (id: string, data: UpdatePlanRequest): Promise<APIResponse<Plan>> => {
  const response = await axios.put<GetPlanResponse>(`/plans/${id}`, data);
  return response.data as APIResponse<Plan>;
};
