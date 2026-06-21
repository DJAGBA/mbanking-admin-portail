export type UrlLimit = {
  id: number
  url: string
  createdAt?: string
  updatedAt?: string
}

export type UrlLimitUser = {
  id: number
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