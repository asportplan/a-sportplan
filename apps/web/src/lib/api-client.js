/**
 * Unified API client for PreciseTrain backend
 * All requests include credentials for cookie-based auth
 */

const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new ApiError('Authentication required. Please log in.', 401, errorData);
    }
    const errorMessage = errorData.message || errorData.error || (errorData.body && errorData.body.message) || `Request failed with status ${response.status}`;
    throw new ApiError(
      errorMessage,
      response.status,
      errorData
    );
  }

  return response.json();
}

export const api = {
  // Auth
  signIn: (email, password) =>
    request('/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signUp: (name, email, password) =>
    request('/auth/sign-up/email', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  signOut: () =>
    request('/auth/sign-out', { method: 'POST' }),
  getSession: () =>
    request('/auth/get-session'),

  // Profile
  getProfile: () => request('/v1/profile'),
  saveProfile: (data) =>
    request('/v1/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Medical Screening
  getScreening: () => request('/v1/medical/screening'),
  saveScreening: (data) =>
    request('/v1/medical/screening', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Equipment
  getEquipment: () => request('/v1/equipments/user'),
  saveEquipment: (data) =>
    request('/v1/equipments/user', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Programs
  generateProgram: (params) =>
    request('/v1/programs/generate', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    }),
  getActiveProgram: () => request('/v1/programs/active'),

  // Health
  health: () => request('/v1/health'),
};

export { ApiError };
