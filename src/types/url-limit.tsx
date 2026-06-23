export interface URLLimitUserDto {
    items:      UrlLimitUser[];
    pagination: Pagination;
}

export interface UrlLimit {
    id:        number;
    url:       string;
    active:    boolean;
    createdAt: Date;
}

export interface Pagination {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
    hasNext:    boolean;
    hasPrev:    boolean;
}


export type UrlLimitUser = {
  id: number
  url:       string;
  userId: number
  username: string
  email: string
  pointsPerMinute: number
  pointsPerHour: number
  pointsPerDay?: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export type CreateUrlRequest = {
  url: string
}

export type AssignUrlUserRequest = {
  pointsPerMinute: number
  pointsPerHour: number
  pointsPerDay?: number
}

export type UpdateUrlUserRequest = {
  pointsPerMinute?: number
  pointsPerHour?: number
  pointsPerDay?: number
  active?: boolean
}

export type ListUrlsResponse = {
  status: {
    code: number
    message: string
    description?: string
  }
  data: {
    items: UrlLimit[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export type GetUrlResponse = {
  status: {
    code: number
    message: string
    description?: string
  }
  data: UrlLimit
}

export type ListUrlUsersResponse = {
  status: {
    code: number
    message: string
    description?: string
  }
  data: {
    items: UrlLimitUser[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export type GetUrlUserResponse = {
  status: {
    code: number
    message: string
    description?: string
  }
  data: UrlLimitUser
}
