import axios from '@/lib/axios';
import type { Plan,CreatePlanRequest,UpdatePlanRequest,ListPlansResponse,GetPlanResponse,} from '@/src/types/plan';
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
export const getPlanById = async (id: string) => {
  const response = await axios.get<GetPlanResponse>(`/plans/${id}`);
  return response.data.data;
};

// POST /plans
export const createPlan = async (data: CreatePlanRequest) => {
  const response = await axios.post<GetPlanResponse>('/plans', data);
  return response.data.data;
};

// PUT /plans/:id
export const updatePlan = async (id: string, data: UpdatePlanRequest) => {
  const response = await axios.put<GetPlanResponse>(`/plans/${id}`, data);
  return response.data.data;
};
