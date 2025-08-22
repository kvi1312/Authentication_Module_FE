import { STORAGE_KEYS, TOKEN_REFRESH_THRESHOLD } from '../utils/constants';

class TokenService {
  private refreshTimer: NodeJS.Timeout | null = null;

  // Token storage in memory
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  setAccessToken(token: string, expiresAt: Date): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, expiresAt.toISOString());
    
    // Setup auto refresh
    this.setupAutoRefresh();
  }

  clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    
    // Clear auto refresh
    this.clearAutoRefresh();
  }

  // Token validation
  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) return true;

    const expiryString = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    if (!expiryString) return true;

    const expiryTime = new Date(expiryString);
    return new Date() >= expiryTime;
  }

  getTokenExpiryTime(token?: string): Date | null {
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) return null;

    const expiryString = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    if (!expiryString) return null;

    return new Date(expiryString);
  }

  shouldRefreshToken(): boolean {
    const expiryTime = this.getTokenExpiryTime();
    if (!expiryTime) return false;

    const now = new Date();
    const timeUntilExpiry = expiryTime.getTime() - now.getTime();
    
    // Refresh if token expires within threshold (default 5 minutes)
    return timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD;
  }

  // Auto refresh setup
  setupAutoRefresh(): void {
    this.clearAutoRefresh();

    const expiryTime = this.getTokenExpiryTime();
    if (!expiryTime) return;

    const now = new Date();
    const timeUntilRefresh = expiryTime.getTime() - now.getTime() - TOKEN_REFRESH_THRESHOLD;

    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        // Dispatch custom event to trigger refresh
        window.dispatchEvent(new CustomEvent('auth:refresh-needed'));
      }, timeUntilRefresh);
    }
  }

  clearAutoRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // JWT token parsing (for debugging/development)
  parseToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  // Get user roles from token
  getUserRolesFromToken(token?: string): string[] {
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) return [];

    const payload = this.parseToken(tokenToCheck);
    if (!payload) return [];

    // JWT claims for roles can vary, common ones are 'role', 'roles', or custom claim
    return payload.role || payload.roles || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
  }

  // Check if user has specific role
  hasRole(role: string, token?: string): boolean {
    const roles = this.getUserRolesFromToken(token);
    return Array.isArray(roles) ? roles.includes(role) : roles === role;
  }
}

// Export singleton instance
export const tokenService = new TokenService();
