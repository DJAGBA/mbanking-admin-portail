/**
 * API Endpoints Constants
 * Centralized definition of all API endpoints
 */
// ========== HELPERS ==========
/**
 * Construit une URL avec des query params
 * Filtre automatiquement les valeurs undefined et vides
 */
export const buildUrl = (
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string => {
  if (!params) return endpoint;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};
// ========== ENDPOINTS ==========
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
  },
  // Users
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    // User actions
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
    RESET_PASSWORD: (id: string) => `/users/${id}/reset-password`,
    REVOKE_TOKEN: (id: string) => `/users/${id}/revoke-token`,
  },
  // Plans (future)
  PLANS: {
    LIST: '/plans',
    CREATE: '/plans',
    GET_BY_ID: (id: string) => `/plans/${id}`,
    UPDATE: (id: string) => `/plans/${id}`,
    DELETE: (id: string) => `/plans/${id}`,
  },
  // Rate Limits (future)
  RATE_LIMITS: {
    LIST: '/rate-limits',
    CREATE: '/rate-limits',
    GET_BY_ID: (id: string) => `/rate-limits/${id}`,
    UPDATE: (id: string) => `/rate-limits/${id}`,
    DELETE: (id: string) => `/rate-limits/${id}`,
    BY_PLANS: '/rate-limits/plans',
    BY_URLS: '/rate-limits/urls',
  },
  // Banks (future)
  BANKS: {
    LIST: '/banks',
    CREATE: '/banks',
    GET_BY_ID: (id: string) => `/banks/${id}`,
    UPDATE: (id: string) => `/banks/${id}`,
    DELETE: (id: string) => `/banks/${id}`,
  },
  // Tokens (future)
  /*
  TOKENS: {
    LIST: '/tokens',
    REVOKE: (id: string) => `/tokens/${id}/revoke`,
    REVOKE_ALL: (userId: string) => `/users/${userId}/tokens/revoke-all`,
  },
  */
} as const;
// ========== CONFIGURATION ==========
export const API_CONFIG = {
  // Mock API for development
  USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK === 'true',

  // API Base URL
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://a944a265-421a-4638-b03a-bc21fc7b6531.mock.pstmn.io',
  // Timeouts (ms)
  TIMEOUT: 10_000,
  UPLOAD_TIMEOUT: 60_000,
} as const;
// ========== MOCK SCENARIOS ==========
export const MOCK_SCENARIOS = {
  // Auth
  AUTH_SUCCESS: 'success',
  AUTH_INVALID_CREDENTIALS: 'invalid_credentials',
  AUTH_MISSING_FIELDS: 'missing_fields',
  // Users
  USERS_LIST: 'list_users',
  USERS_FOUND: 'found',
  USERS_NOT_FOUND: 'not_found',
  USERS_CREATED: 'created',
  USERS_CONFLICT_USERNAME: 'conflict_username',
  USERS_MISSING_EMAIL: 'missing_email',
  USERS_UNKNOWN_FIELD: 'unknown_field',
} as const;
// ========== TYPES (optionnel mais pratique) ==========
export type ApiEndpoint = typeof API_ENDPOINTS;
export type MockScenario = typeof MOCK_SCENARIOS[keyof typeof MOCK_SCENARIOS];