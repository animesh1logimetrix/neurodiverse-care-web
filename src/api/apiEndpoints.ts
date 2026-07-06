// Centralized dictionary of API routes
// This prevents magic strings across your application

export const API_ENDPOINTS = {
  // Example Endpoints
  EXAMPLE: {
    GET_ALL: '/examples',
    GET_BY_ID: (id: string | number) => `/examples/${id}`,
    CREATE: '/examples',
    UPDATE: (id: string | number) => `/examples/${id}`,
    DELETE: (id: string | number) => `/examples/${id}`,
  },
  
  // Define future feature endpoints here, e.g.,
  // USERS: { ... },
  // AUTH: { ... },
};
