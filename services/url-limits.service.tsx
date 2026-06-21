import axios from '@/lib/axios';
import type {CreateUrlRequest,AssignUrlUserRequest,UpdateUrlUserRequest,ListUrlsResponse,GetUrlResponse,ListUrlUsersResponse,GetUrlUserResponse,} from '@/src/types/url-limit';
// GET /url-limits
export const getUrlLimits = async (page: number = 1, limit: number = 20) => {
  const response = await axios.get<ListUrlsResponse>(
    `/url-limits?page=${page}&limit=${limit}`
  );
  return response.data;
};
// GET /url-limits/:id
export const getUrlLimitById = async (id: string) => {
  const response = await axios.get<GetUrlResponse>(`/url-limits/${id}`);
  return response.data.data;
};
// POST /url-limits
export const createUrlLimit = async (data: CreateUrlRequest) => {
  const response = await axios.post<GetUrlResponse>('/url-limits', data);
  return response.data.data;
};
// DELETE /url-limits/:id
export const deleteUrlLimit = async (id: string) => {
  const response = await axios.delete(`/url-limits/${id}`);
  return response.data;
};
// GET /url-limits/:id/users
export const getUrlLimitUsers = async (id: string, page: number = 1, limit: number = 20) => {
  const response = await axios.get<ListUrlUsersResponse>(
    `/url-limits/${id}/users?page=${page}&limit=${limit}`
  );
  return response.data;
};
// POST /url-limits/:id/users/:userId/assign
export const assignUrlLimitUser = async (
  id: string,
  userId: string,
  data: AssignUrlUserRequest
) => {
  const response = await axios.post<GetUrlUserResponse>(
    `/url-limits/${id}/users/${userId}/assign`,
    data
  );
  return response.data.data;
};
// PUT /url-limits/:id/users/:userId
export const updateUrlLimitUser = async (
  id: string,
  userId: string,
  data: UpdateUrlUserRequest
) => {
  const response = await axios.put<GetUrlUserResponse>(
    `/url-limits/${id}/users/${userId}`,
    data
  );
  return response.data.data;
};
// DELETE /url-limits/:id/users/:userId
export const deleteUrlLimitUser = async (id: string, userId: string) => {
  const response = await axios.delete(`/url-limits/${id}/users/${userId}`);
  return response.data;
};
