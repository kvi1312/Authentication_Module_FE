export const UserType = {
  Admin: 0,
  Partner: 1,
  EndUser: 2
} as const;

export type UserType = typeof UserType[keyof typeof UserType];

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { [key: string]: string[] };
}

export interface ApiError {
  message: string;
  errors?: { [key: string]: string[] };
  statusCode: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
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
  accessToken: string;
  refreshToken: null;  // Always null now (in cookies)
  rememberMeToken: null;  // Always null now (in cookies)
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  rememberMeTokenExpiresAt?: string;
  user: UserInfo;
  sessionId?: string;
}

export type RefreshTokenRequest = Record<string, never>;

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: null;  // Always null now (in cookies)
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  isRememberMe: boolean;  // NEW: Indicates session type
}

export type LogoutRequest = Record<string, never>;

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface TokenConfigResponse {
  accessTokenExpiryMinutes: number;
  refreshTokenExpiryDays: number;
  rememberMeTokenExpiryDays: number;
  lastUpdated?: string;
  updatedBy?: string;
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
  warning?: string;
}

export interface TokenPresetResponse {
  message: string;
  presets: {
    [key: string]: {
      access: string;
      refresh: string;
      remember: string;
    };
  };
  usage: string;
}

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
  isAuthenticated: boolean;
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  tokenExpiresAt: Date | null;
  
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isPartner: () => boolean;
  isEndUser: () => boolean;
  isRememberMeSession: () => boolean;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: { [key: string]: string[] };
  statusCode: number;
}

export const ApiStatusCodes = {
  OK: 200,
  CREATED: 201,
  
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

export type ApiStatusCodes = typeof ApiStatusCodes[keyof typeof ApiStatusCodes];
