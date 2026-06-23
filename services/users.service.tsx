import axios from '@/lib/axios';
import type {UserData,CreateUserRequest,UpdateUserRequest,ListUsersResponse,GetUserResponse,} from '@/src/types/user';
import {APIResponse} from "@/src/types/ApiResponse";
// GET /users - Paginated list
export const getUsers = async (
  page: number = 1,
  limit: number = 20,
  search?: string,
  active?: boolean
) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', Math.min(limit, 100).toString());
  if (search) params.append('search', search);
  if (active !== undefined) params.append('active', active.toString());

  const response = await axios.get<ListUsersResponse>(`/users?${params.toString()}`);
  // Returns the full payload { status, data: { items, pagination } } to match the bank pattern
  return response.data;
};
// GET /users/:id - Details
export const getUserById = async (id: string): Promise<APIResponse<UserData>> => {
  const response = await axios.get<GetUserResponse>(`/users/${id}`);
  return response.data as APIResponse<UserData>;
};
// POST /users - Create
export const createUser = async (
  data: CreateUserRequest | UpdateUserRequest
): Promise<APIResponse<UserData>> => {
  const response = await axios.post<GetUserResponse>('/users', data);
  return response.data as APIResponse<UserData>;
};
// PUT /users/:id - Update
export const updateUser = async (
  userId: string,
  data: UpdateUserRequest
): Promise<APIResponse<UserData>> => {

  const res = await axios.put(`/users/${userId}`, data);
  return res.data as APIResponse<UserData> ;
};
// PATCH /users/:id/activate - Activate
export const activateUser = async (id: string): Promise<APIResponse<UserData>> => {
  const response = await axios.patch(`/users/${id}/activate`);
  return response.data as APIResponse<UserData>;
};
// PATCH /users/:id/deactivate - Deactivate
export const deactivateUser = async (id: string): Promise<APIResponse<UserData>> => {
  const response = await axios.patch(`/users/${id}/deactivate`);
  return response.data as APIResponse<UserData>;
};
// POST /users/:id/reset-password - Reset password
export const resetPassword = async (id: string): Promise<APIResponse<UserData>> => {
  const response = await axios.post(`/users/${id}/reset-password`);
  return response.data as APIResponse<UserData>;
};
// POST /users/:id/revoke-token - Revoke token
export const revokeTokens = async (id: string): Promise<APIResponse<UserData>> => {
  const response = await axios.post(`/users/${id}/revoke-token`);
  return response.data as APIResponse<UserData>;
};
// DELETE /users/:id - Delete
export const deleteUser = async (id: string): Promise<APIResponse<UserData>> => {
  const response = await axios.delete(`/users/${id}`);
  return response.data as APIResponse<UserData>;
};