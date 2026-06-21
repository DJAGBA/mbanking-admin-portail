// Types pour les utilisateurs

export interface UserData {
  id: string;
  username: string;
  email: string;
  name?: string;
  version?: string;
  operation?: string;
  callbackUrl?: string;
  corporateMomoAccount?: string;
  corporateMomoCode?: string;
  momoAlias?: string;
  momoCode?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  name?: string;
  version?: string;
  operation?: string;
  callbackUrl?: string;
  corporateMomoAccount?: string;
  corporateMomoCode?: string;
  momoAlias?: string;
  momoCode?: string;
  active?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  version?: string;
  operation?: string;
  callbackUrl?: string;
  corporateMomoAccount?: string;
  corporateMomoCode?: string;
  momoAlias?: string;
  momoCode?: string;
  active?: boolean;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiStatus {
  code: number;
  message: string;
  description?: string;
}

export interface ListUsersData {
  items: UserData[];
  pagination: Pagination;
}

export interface ListUsersResponse {
  status: ApiStatus;
  data: ListUsersData;
  errors?: Record<string, string>;
}

export interface GetUserResponse {
  status: ApiStatus;
  data: UserData;
  errors?: Record<string, string>;
}