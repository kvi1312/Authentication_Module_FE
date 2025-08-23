export const API_BASE_URL = '';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Authentication Module';
export const TOKEN_REFRESH_THRESHOLD = Number(import.meta.env.VITE_TOKEN_REFRESH_THRESHOLD) || 300000;
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token'
  },
  ADMIN: {
    TOKEN_CONFIG: '/api/admin/token-config',
    TOKEN_CONFIG_RESET: '/api/admin/token-config/reset',
    TOKEN_CONFIG_PRESET: (preset: string) => `/api/admin/token-config/preset/${preset}`
  }
} as const;
export const TOKEN_PRESETS = {
  'very-short': {
    name: 'Very Short',
    description: '5min access, 1 day refresh, 1 day remember'
  },
  'short': {
    name: 'Short',
    description: '15min access, 3 days refresh, 7 days remember'
  },
  'medium': {
    name: 'Medium',
    description: '30min access, 7 days refresh, 30 days remember'
  },
  'long': {
    name: 'Long',
    description: '60min access, 30 days refresh, 90 days remember'
  }
} as const;
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  TOKEN_EXPIRES_AT: 'auth_token_expires_at',
  ACCESS_TOKEN_EXPIRES_AT: 'auth_access_token_expires_at',
  REFRESH_TOKEN: 'auth_refresh_token',
  REFRESH_TOKEN_EXPIRES_AT: 'auth_refresh_token_expires_at',
  REMEMBER_ME_TOKEN_EXPIRES_AT: 'auth_remember_me_token_expires_at',
  USER_INFO: 'auth_user_info'
} as const;
export const USER_TYPE_LABELS = {
  0: 'Admin',
  1: 'Partner', 
  2: 'End User'
} as const;
export const VALIDATION_RULES = {
  EMAIL: {
    REQUIRED: 'Email is required',
    INVALID: 'Please enter a valid email address'
  },
  PASSWORD: {
    REQUIRED: 'Password is required',
    MIN_LENGTH: 'Password must be at least 8 characters',
    PATTERN: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  },
  CONFIRM_PASSWORD: {
    REQUIRED: 'Please confirm your password',
    MISMATCH: 'Passwords do not match'
  },
  USERNAME: {
    REQUIRED: 'Username is required',
    MIN_LENGTH: 'Username must be at least 3 characters'
  },
  FIRST_NAME: {
    REQUIRED: 'First name is required'
  },
  LAST_NAME: {
    REQUIRED: 'Last name is required'
  }
} as const;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const DEFAULT_TOKEN_CONFIG = {
  accessTokenExpiryMinutes: 30,
  refreshTokenExpiryDays: 7,
  rememberMeTokenExpiryDays: 30,
  accessTokenExpiryDisplay: '30 minutes',
  refreshTokenExpiryDisplay: '7 days',
  rememberMeTokenExpiryDisplay: '30 days'
} as const;

