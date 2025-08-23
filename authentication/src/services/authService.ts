import { apiService } from './api';
import { tokenService } from './tokenService';
import type { LoginRequest, LoginResponse, RegisterRequest, UserInfo, RefreshTokenResponse } from '../types/auth.types';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/api/auth/login', credentials);
    
    if (response.data.accessToken) {
      tokenService.setTokensFromLoginResponse(response.data);
      
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
      await apiService.post('/api/auth/logout');
    } finally {
      tokenService.clearTokens();
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const response = await apiService.post<RefreshTokenResponse>('/api/auth/refresh-token');
      
      if (response.data.accessToken) {
        tokenService.setTokensFromRefreshResponse(response.data);
        return response.data.accessToken;
      }
      
      return null;
    } catch (error) {
      tokenService.clearTokens();
      throw error;
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

  isAuthenticated(): boolean {
    const token = tokenService.getAccessToken();
    return !!token;
  }
}

export const authService = new AuthService();
