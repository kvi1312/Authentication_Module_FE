import type { LoginResponse, RefreshTokenResponse } from '../types/auth.types';
class TokenService {
  setTokensFromLoginResponse(response: LoginResponse): void {
    if (response.accessToken) {
      localStorage.setItem('auth_access_token', response.accessToken);
    }
    if (response.accessTokenExpiresAt) {
      localStorage.setItem('auth_access_token_expires_at', response.accessTokenExpiresAt);
    }
    if (response.refreshTokenExpiresAt) {
      localStorage.setItem('auth_refresh_token_expires_at', response.refreshTokenExpiresAt);
    }
  }
  setTokensFromRefreshResponse(response: RefreshTokenResponse): void {
    if (response.accessToken) {
      localStorage.setItem('auth_access_token', response.accessToken);
    }
    if (response.accessTokenExpiresAt) {
      localStorage.setItem('auth_access_token_expires_at', response.accessTokenExpiresAt);
    }
    if (response.refreshTokenExpiresAt) {
      localStorage.setItem('auth_refresh_token_expires_at', response.refreshTokenExpiresAt);
    }
    if (response.isRememberMe !== undefined) {
      localStorage.setItem('auth_is_remember_me', response.isRememberMe.toString());
    }
  }
  getAccessToken(): string | null {
    return localStorage.getItem('auth_access_token');
  }
  getRefreshTokenExpiry(): Date | null {
    const expiresAt = localStorage.getItem('auth_refresh_token_expires_at');
    return expiresAt ? new Date(expiresAt) : null;
  }
  getAccessTokenExpiry(): Date | null {
    const expiresAt = localStorage.getItem('auth_access_token_expires_at');
    return expiresAt ? new Date(expiresAt) : null;
  }
  isRememberMeSession(): boolean {
    const isRememberMe = localStorage.getItem('auth_is_remember_me');
    return isRememberMe === 'true';
  }
  clearTokens(): void {
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_access_token_expires_at');
    localStorage.removeItem('auth_refresh_token_expires_at');
    localStorage.removeItem('auth_is_remember_me');
    localStorage.removeItem('auth_user_info');
  }
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('auth_access_token_expires_at');
    if (!expiresAt) return true;
    const expiryTime = new Date(expiresAt);
    const now = new Date();
    return now >= expiryTime;
  }
  async isSessionValid(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired();
  }
}
export const tokenService = new TokenService();

