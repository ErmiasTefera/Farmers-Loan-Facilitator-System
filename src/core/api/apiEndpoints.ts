// Central API routes
// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
} as const;

// User management endpoints
export const USER_ENDPOINTS = {
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  CHANGE_PASSWORD: '/users/change-password',
  DELETE_ACCOUNT: '/users/delete',
  LIST: '/users',
  GET_BY_ID: (id: string) => `/users/${id}`,
} as const;

// Resource CRUD endpoints
export const API_ENDPOINTS = {
  // Generic resource endpoints
  CREATE: (resource: string) => `/${resource}`,
  READ: (resource: string, id?: string) => id ? `/${resource}/${id}` : `/${resource}`,
  UPDATE: (resource: string, id: string) => `/${resource}/${id}`,
  DELETE: (resource: string, id: string) => `/${resource}/${id}`,
  
  // Common API patterns
  SEARCH: (resource: string) => `/${resource}/search`,
}