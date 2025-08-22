import { apiService } from './api';
import { tokenService } from './tokenService';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
  LogoutResponse,
  UserInfo
} from '../types/auth.types';

class AuthService {
  // User registration
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiService.post<RegisterResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // User login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      const loginData = response.data;

      // Store tokens and user info if login successful
      if (loginData.success && loginData.accessToken) {
        const expiresAt = loginData.expiresAt 
          ? new Date(loginData.expiresAt)
          : new Date(Date.now() + 30 * 60 * 1000); // Default 30 minutes

        tokenService.setAccessToken(loginData.accessToken, expiresAt);

        // Store user info
        if (loginData.user) {
          // Store detected userType
          if (loginData.user.userType !== undefined) {
            localStorage.setItem('userType', loginData.user.userType.toString());
          }
          
          const userInfo: UserInfo = {
            ...loginData.user,
            lastLoginAt: loginData.user.lastLoginAt ? new Date(loginData.user.lastLoginAt) : undefined,
            createdDate: new Date(loginData.user.createdDate)
          };
          
          localStorage.setItem('auth_user_info', JSON.stringify(userInfo));
        }
      }

      return loginData;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // User logout
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await apiService.post<LogoutResponse>(
        API_ENDPOINTS.AUTH.LOGOUT
      );

      // Always clear local tokens, even if API call fails
      tokenService.clearTokens();

      return response.data;
    } catch (error: any) {
      // Clear tokens even if logout API fails
      tokenService.clearTokens();
      throw error.response?.data || error;
    }
  }

  // Refresh access token
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const response = await apiService.post<RefreshTokenResponse>(
        API_ENDPOINTS.AUTH.REFRESH_TOKEN
      );

      const refreshData = response.data;

      // Update stored token if refresh successful
      if (refreshData.success && refreshData.accessToken) {
        const expiresAt = refreshData.expiresAt 
          ? new Date(refreshData.expiresAt)
          : new Date(Date.now() + 30 * 60 * 1000); // Default 30 minutes

        tokenService.setAccessToken(refreshData.accessToken, expiresAt);
      }

      return refreshData;
    } catch (error: any) {
      // If refresh fails, clear tokens and redirect to login
      tokenService.clearTokens();
      throw error.response?.data || error;
    }
  }

  // Get current user info
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
    } catch (error) {
      console.error('Error parsing user info:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = tokenService.getAccessToken();
    return !!token && !tokenService.isTokenExpired(token);
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    if (!this.isAuthenticated()) return false;
    return tokenService.hasRole(role);
  }

  // Check user type helpers
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.userType === 0; // Admin
  }

  isPartner(): boolean {
    const user = this.getCurrentUser();
    return user?.userType === 1; // Partner
  }

  isEndUser(): boolean {
    const user = this.getCurrentUser();
    return user?.userType === 2; // EndUser
  }

  // Initialize auth state (call this on app startup)
  initializeAuth(): void {
    // Set up auto refresh if user is already logged in
    if (this.isAuthenticated()) {
      tokenService.setupAutoRefresh();
    }

    // Listen for auth events
    window.addEventListener('auth:refresh-needed', this.handleAutoRefresh.bind(this));
    window.addEventListener('auth:logout', this.handleForceLogout.bind(this));
  }

  // Clean up event listeners
  cleanup(): void {
    window.removeEventListener('auth:refresh-needed', this.handleAutoRefresh.bind(this));
    window.removeEventListener('auth:logout', this.handleForceLogout.bind(this));
    tokenService.clearAutoRefresh();
  }

  private async handleAutoRefresh(): Promise<void> {
    try {
      await this.refreshToken();
    } catch (error) {
      console.error('Auto refresh failed:', error);
      // Force logout will be handled by the auth context
    }
  }

  private handleForceLogout(): void {
    tokenService.clearTokens();
    // Additional cleanup can be done here
  }
}

// Export singleton instance
export const authService = new AuthService();
