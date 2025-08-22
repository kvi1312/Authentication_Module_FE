// User Types
export const UserType = {
  Admin: 0,
  Partner: 1,
  EndUser: 2
} as const;

export type UserType = typeof UserType[keyof typeof UserType];

// Base API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { [key: string]: string[] };
}

// Error Response
export interface ApiError {
  message: string;
  errors?: { [key: string]: string[] };
  statusCode: number;
}

// User Registration (Simplified - Always EndUser for public registration)
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  // userType removed - always EndUser for security
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    userType: UserType;
    isActive: boolean;
    createdDate: string;
  };
}

// User Login
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  rememberMeToken?: string;
  expiresAt?: string;
  sessionId?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    isActive: boolean;
    lastLoginAt?: string;
    createdDate: string;
    roles: string[];
    userType: UserType;
  };
}

// Token Refresh
export interface RefreshTokenRequest {
  // Empty body - refresh token sent via HTTP-only cookie
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  expiresAt?: string;
  sessionId?: string;
}

// User Logout
export interface LogoutRequest {
  // Empty body - requires Authorization header
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// Token Configuration
export interface TokenConfigResponse {
  accessTokenExpiryMinutes: number;
  refreshTokenExpiryDays: number;
  rememberMeTokenExpiryDays: number;
  accessTokenExpiryDisplay: string;
  refreshTokenExpiryDisplay: string;
  rememberMeTokenExpiryDisplay: string;
}

export interface UpdateTokenConfigRequest {
  accessTokenExpiryMinutes?: number;
  refreshTokenExpiryDays?: number;
  rememberMeTokenExpiryDays?: number;
}

export interface UpdateTokenConfigResponse {
  success: boolean;
  message: string;
  config?: TokenConfigResponse;
}

// Authentication State
export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  tokenExpiresAt: Date | null;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: UserType;
  roles: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdDate: Date;
}

export interface AuthContextType {
  // State
  isAuthenticated: boolean;
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  tokenExpiresAt: Date | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  
  // Utilities
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isPartner: () => boolean;
  isEndUser: () => boolean;
}

// Token Configuration State
export interface TokenConfigState {
  config: TokenConfigResponse | null;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
}

export interface TokenConfigContextType {
  // State
  config: TokenConfigResponse | null;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  
  // Actions
  loadConfig: () => Promise<void>;
  updateConfig: (config: UpdateTokenConfigRequest) => Promise<void>;
  resetConfig: () => Promise<void>;
  applyPreset: (preset: string) => Promise<void>;
  
  // Form helpers
  setDirty: (dirty: boolean) => void;
  clearError: () => void;
}

// Error Response Types
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: { [key: string]: string[] };
  statusCode: number;
}

// HTTP Status Codes
export const ApiStatusCodes = {
  // Success
  OK: 200,
  CREATED: 201,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

export type ApiStatusCodes = typeof ApiStatusCodes[keyof typeof ApiStatusCodes];
