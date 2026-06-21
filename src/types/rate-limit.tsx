export type RateLimit = {
  id: number
  userId: number
  username: string
  email: string
  planName: string
  planDisplayName: string
  pointsPerMinute: number
  pointsPerHour: number
  pointsPerDay?: number
  customPointsPerMinute?: number | null
  customPointsPerHour?: number | null
  customPointsPerDay?: number | null
  startDate?: string
  endDate?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export type RateLimitHistory = {
  id: number;
  action: 'created' | 'updated' | 'expired' | 'cancelled';
  planName: string;
  notes?: string;
  changedAt: string;
}

export type AssignPlanRequest = {
  planName: string
  customPointsPerMinute?: number
  customPointsPerHour?: number
  customPointsPerDay?: number
  endDate?: string
  notes?: string
}

export type UpdateCustomLimitsRequest = {
  customPointsPerMinute?: number | null
  customPointsPerHour?: number | null
  customPointsPerDay?: number | null
  notes?: string
}

export type ListRateLimitsResponse = {
  status: {
    code: number
    message: string
    description?: string
  }
  data: {
    items: RateLimit[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

export type GetRateLimitResponse = {
  status: {
    code: number
    message: string
    description?: string
  }
  data: RateLimit
}

export type RateLimitHistoryResponse = {
  status: {
    code: number
    message: string
    description?: string
  }
  data: {
    items: RateLimitHistory[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}