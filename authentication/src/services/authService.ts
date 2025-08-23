import { apiService } from './api';
import type { LoginRequest, LoginResponse, RegisterRequest, UserInfo, RefreshTokenResponse } from '../types/auth.types';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/api/auth/login', credentials);
    
    if (response.data.accessToken) {
      // ✅ KEEP: Store access token for API calls
      localStorage.setItem('auth_access_token', response.data.accessToken);
      
      if (response.data.accessTokenExpiresAt) {
        localStorage.setItem('auth_access_token_expires_at', response.data.accessTokenExpiresAt);
      }
      
      if (response.data.refreshTokenExpiresAt) {
        localStorage.setItem('auth_refresh_token_expires_at', response.data.refreshTokenExpiresAt);
      }
      
      // ✅ NEW: Store remember me choice for UI purposes
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
      // Call backend to clear HttpOnly cookies
      await apiService.post('/api/auth/logout', {});
    } finally {
      // Clear localStorage data
      this.clearAuthData();
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      // Cookie-based refresh - no need to send refresh token in body
      const response = await apiService.post<RefreshTokenResponse>('/api/auth/refresh-token', {});
      
      if (response.data.accessToken) {
        localStorage.setItem('auth_access_token', response.data.accessToken);
        
        if (response.data.accessTokenExpiresAt) {
          localStorage.setItem('auth_access_token_expires_at', response.data.accessTokenExpiresAt);
        }
        
        if (response.data.refreshTokenExpiresAt) {
          localStorage.setItem('auth_refresh_token_expires_at', response.data.refreshTokenExpiresAt);
        }
        
        // Store remember me session type
        if (response.data.isRememberMe !== undefined) {
          localStorage.setItem('auth_is_remember_me', response.data.isRememberMe.toString());
        }
        
        return response.data.accessToken;
      }
      
      return null;
    } catch (error) {
      // Clear localStorage on refresh failure
      this.clearAuthData();
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

  // ✅ NEW: Add this method for proper session checking
  async validateSession(): Promise<boolean> {
    try {
      const response = await apiService.post<RefreshTokenResponse>('/api/auth/refresh-token', {});
      
      if (response.data.accessToken) {
        // Update tokens if refresh succeeds
        localStorage.setItem('auth_access_token', response.data.accessToken);
        
        if (response.data.accessTokenExpiresAt) {
          localStorage.setItem('auth_access_token_expires_at', response.data.accessTokenExpiresAt);
        }
        
        if (response.data.refreshTokenExpiresAt) {
          localStorage.setItem('auth_refresh_token_expires_at', response.data.refreshTokenExpiresAt);
        }
        
        // Update remember me status from server
        if (response.data.isRememberMe !== undefined) {
          localStorage.setItem('auth_is_remember_me', response.data.isRememberMe.toString());
        }
        
        return true;
      }
      
      return false;
    } catch {
      // Session invalid, clear localStorage
      this.clearAuthData();
      return false;
    }
  }

  // ✅ NEW: Helper method to clear auth data
  private clearAuthData(): void {
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_access_token_expires_at');
    localStorage.removeItem('auth_refresh_token_expires_at');
    localStorage.removeItem('auth_is_remember_me');
    localStorage.removeItem('auth_user_info');
  }

  // ✅ UPDATE: More robust authentication check
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_access_token');
    const tokenExpiry = localStorage.getItem('auth_access_token_expires_at');
    
    if (!token) return false;
    
    // Check if access token is expired
    if (tokenExpiry) {
      const expiryDate = new Date(tokenExpiry);
      const now = new Date();
      
      // If access token expired, need to check session via refresh
      if (expiryDate <= now) {
        // This will trigger refresh in the interceptor
        return true; // Let interceptor handle refresh
      }
    }
    
    return true;
  }

  // ✅ NEW: Check if current session is Remember Me
  isRememberMeSession(): boolean {
    const isRememberMe = localStorage.getItem('auth_is_remember_me');
    return isRememberMe === 'true';
  }
}

export const authService = new AuthService();
