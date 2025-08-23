import type { LoginResponse } from '../types/auth.types';

class TokenService {
  setTokensFromLoginResponse(response: LoginResponse): void {
    if (response.accessToken) {
      localStorage.setItem('auth_access_token', response.accessToken);
    }
    
    if (response.refreshToken) {
      localStorage.setItem('auth_refresh_token', response.refreshToken);
    }

    if (response.expiresAt) {
      localStorage.setItem('auth_access_token_expires_at', response.expiresAt);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('auth_access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('auth_refresh_token');
  }

  clearTokens(): void {
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_access_token_expires_at');
    localStorage.removeItem('auth_user_info');
  }

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('auth_access_token_expires_at');
    if (!expiresAt) return true;

    const expiryTime = new Date(expiresAt);
    const now = new Date();
    
    return now >= expiryTime;
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired();
  }
}

export const tokenService = new TokenService();
