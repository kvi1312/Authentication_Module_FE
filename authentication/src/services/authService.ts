import { apiService } from './api';
import type { LoginRequest, LoginResponse, RegisterRequest, UserInfo, RefreshTokenResponse } from '../types/auth.types';
class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/api/auth/login', credentials);
    if (response.data.accessToken) {
      localStorage.setItem('auth_access_token', response.data.accessToken);
      if (response.data.accessTokenExpiresAt) {
        localStorage.setItem('auth_access_token_expires_at', response.data.accessTokenExpiresAt);
      }
      if (response.data.refreshTokenExpiresAt) {
        localStorage.setItem('auth_refresh_token_expires_at', response.data.refreshTokenExpiresAt);
      }
      localStorage.setItem('auth_is_remember_me', credentials.rememberMe.toString());
      if (response.data.user) {
        const userInfo: UserInfo = {
          ...response.data.user,
          lastLoginAt: response.data.user.lastLoginAt ? new Date(response.data.user.lastLoginAt) : undefined,
          createdDate: new Date(response.data.user.createdDate)
        };
        localStorage.setItem('auth_user_info', JSON.stringify(userInfo));
      }
    }
    return response.data;
  }
  async register(credentials: RegisterRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/api/auth/register', credentials);
    return response.data;
  }
  async logout(): Promise<void> {
    try {
      await apiService.post('/api/auth/logout', {});
    } finally {
      this.clearAuthData();
    }
  }
  async refreshToken(): Promise<string | null> {
    try {
      const response = await apiService.post<RefreshTokenResponse>('/api/auth/refresh-token', {});
      if (response.data.accessToken) {
        localStorage.setItem('auth_access_token', response.data.accessToken);
        if (response.data.accessTokenExpiresAt) {
          localStorage.setItem('auth_access_token_expires_at', response.data.accessTokenExpiresAt);
        }
        if (response.data.refreshTokenExpiresAt) {
          localStorage.setItem('auth_refresh_token_expires_at', response.data.refreshTokenExpiresAt);
        }
        if (response.data.isRememberMe !== undefined) {
          localStorage.setItem('auth_is_remember_me', response.data.isRememberMe.toString());
        }
        return response.data.accessToken;
      }
      return null;
    } catch (err) {
      console.error('Error refreshing token:', err);
      this.clearAuthData();
      throw err;
    }
  }
  getCurrentUser(): UserInfo | null {
    try {
      const userInfoString = localStorage.getItem('auth_user_info');
      if (!userInfoString) return null;
      const userInfo = JSON.parse(userInfoString);
      return {
        ...userInfo,
        lastLoginAt: userInfo.lastLoginAt ? new Date(userInfo.lastLoginAt) : undefined,
        createdDate: new Date(userInfo.createdDate)
      };
    } catch {
      return null;
    }
  }
  async fetchCurrentUserFromServer(): Promise<UserInfo | null> {
    try {
      const response = await apiService.get<{ data: UserInfo }>('/api/user/profile');
      const userInfo = response.data.data;
      if (userInfo) {
        const userInfoWithDates: UserInfo = {
          ...userInfo,
          lastLoginAt: userInfo.lastLoginAt ? new Date(userInfo.lastLoginAt) : undefined,
          createdDate: new Date(userInfo.createdDate)
        };
        localStorage.setItem('auth_user_info', JSON.stringify(userInfoWithDates));
        return userInfoWithDates;
      }
      return null;
    } catch (err) {
      console.error('Error getting current user:', err);
      return null;
    }
  }
  async validateSession(): Promise<boolean> {
    try {
      const response = await apiService.post<RefreshTokenResponse>('/api/auth/refresh-token', {});
      if (response.data.accessToken) {
        localStorage.setItem('auth_access_token', response.data.accessToken);
        if (response.data.accessTokenExpiresAt) {
          localStorage.setItem('auth_access_token_expires_at', response.data.accessTokenExpiresAt);
        }
        if (response.data.refreshTokenExpiresAt) {
          localStorage.setItem('auth_refresh_token_expires_at', response.data.refreshTokenExpiresAt);
        }
        if (response.data.isRememberMe !== undefined) {
          localStorage.setItem('auth_is_remember_me', response.data.isRememberMe.toString());
        }
        return true;
      }
      return false;
    } catch {
      this.clearAuthData();
      return false;
    }
  }
  private clearAuthData(): void {
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_access_token_expires_at');
    localStorage.removeItem('auth_refresh_token_expires_at');
    localStorage.removeItem('auth_is_remember_me');
    localStorage.removeItem('auth_user_info');
  }
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_access_token');
    const tokenExpiry = localStorage.getItem('auth_access_token_expires_at');
    if (!token) return false;
    if (tokenExpiry) {
      const expiryDate = new Date(tokenExpiry);
      const now = new Date();
      if (expiryDate <= now) {
        return true; // Let interceptor handle refresh
      }
    }
    return true;
  }
  isRememberMeSession(): boolean {
    const isRememberMe = localStorage.getItem('auth_is_remember_me');
    return isRememberMe === 'true';
  }
}
export const authService = new AuthService();

