export type Plan = {
  id: number
  name: string
  displayName: string
  pointsPerMinute: number
  pointsPerHour: number
  pointsPerDay?: number
  description?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}
// Type definitions for the Plan entity, including the main Plan type with all its properties, as well as types for creating and updating a plan, and the response types for listing and getting a plan, which include status information and pagination details for the list response
export type PaginatedPlans = {
  items: Plan[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type CreatePlanRequest = {
  name: string
  displayName: string
  pointsPerMinute: number
  pointsPerHour: number
  pointsPerDay?: number
  description?: string
}

export type UpdatePlanRequest = Partial<CreatePlanRequest>

export type ListPlansResponse = {
  status: {
    code: number
    message: string
    description?: string
  }
  data: PaginatedPlans
}

export type GetPlanResponse = {
  status: {
    code: number
    message: string
    description?: string
  }
  data: Plan
}