import axios from '@/lib/axios';
import { APIResponse } from '@/src/types/ApiResponse';
import type {CreateUrlRequest,AssignUrlUserRequest,UpdateUrlUserRequest,ListUrlsResponse, UrlLimit, UrlLimitUser, URLLimitUserDto,} from '@/src/types/url-limit';
// GET /url-limits
export const getUrlLimits = async (page: number = 1, limit: number = 20) => {
  const response = await axios.get<ListUrlsResponse>(
    `/url-limits?page=${page}&limit=${limit}`
  );
  return response.data;
};
// GET /url-limits/:id
export const getUrlLimitById = async (id: string): Promise<APIResponse<UrlLimit>> => {
  const response = await axios.get(`/url-limits/${id}`);
  return response.data as APIResponse<UrlLimit>;
};
// POST /url-limits
export const createUrlLimit = async (data: CreateUrlRequest): Promise<APIResponse<UrlLimit>> => {
  const response = await axios.post('/url-limits', data);
  return response.data as APIResponse<UrlLimit>;
};
// DELETE /url-limits/:id
export const deleteUrlLimit = async (id: string): Promise<APIResponse<UrlLimit>> => {
  const response = await axios.delete(`/url-limits/${id}`);
  return response.data as APIResponse<UrlLimit>;
};
// GET /url-limits/:id/users
export const getUrlLimitUsers = async (id: string, page: number = 1, limit: number = 20): Promise<APIResponse<URLLimitUserDto>> => {
  const response = await axios.get(
    `/url-limits/${id}/users?page=${page}&limit=${limit}`
  );
  return response.data ;
};
// POST /url-limits/:id/users/:userId/assign
export const assignUrlLimitUser = async (
  id: string,
  userId: string,
  data: AssignUrlUserRequest
): Promise<APIResponse<UrlLimitUser>> => {
  const response = await axios.post(
    `/url-limits/${id}/users/${userId}/assign`,
    data
  );
  return response.data as APIResponse<UrlLimitUser>;
};
// PUT /url-limits/:id/users/:userId
export const updateUrlLimitUser = async (
  id: string,
  userId: string,
  data: UpdateUrlUserRequest
): Promise<APIResponse<UrlLimitUser>> => {
  const response = await axios.put(
    `/url-limits/${id}/users/${userId}`,
    data
  );
  return response.data as APIResponse<UrlLimitUser>;
};
// DELETE /url-limits/:id/users/:userId
export const deleteUrlLimitUser = async (id: string, userId: string) => {
  const response = await axios.delete(`/url-limits/${id}/users/${userId}`);
  return response.data;
};
