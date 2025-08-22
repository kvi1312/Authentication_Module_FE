import { apiService } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  TokenConfigResponse,
  UpdateTokenConfigRequest,
  UpdateTokenConfigResponse
} from '../types/auth.types';

class AdminService {
  // Get current token configuration
  async getTokenConfig(): Promise<TokenConfigResponse> {
    try {
      const response = await apiService.get<TokenConfigResponse>(
        API_ENDPOINTS.ADMIN.TOKEN_CONFIG
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Update token configuration
  async updateTokenConfig(config: UpdateTokenConfigRequest): Promise<UpdateTokenConfigResponse> {
    try {
      const response = await apiService.put<UpdateTokenConfigResponse>(
        API_ENDPOINTS.ADMIN.TOKEN_CONFIG,
        config
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Reset token configuration to defaults
  async resetTokenConfig(): Promise<UpdateTokenConfigResponse> {
    try {
      const response = await apiService.post<UpdateTokenConfigResponse>(
        API_ENDPOINTS.ADMIN.TOKEN_CONFIG_RESET
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Apply token configuration preset
  async applyTokenConfigPreset(preset: string): Promise<UpdateTokenConfigResponse> {
    try {
      const response = await apiService.post<UpdateTokenConfigResponse>(
        API_ENDPOINTS.ADMIN.TOKEN_CONFIG_PRESET(preset)
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Validate token configuration values
  validateTokenConfig(config: UpdateTokenConfigRequest): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    if (config.accessTokenExpiryMinutes !== undefined) {
      if (config.accessTokenExpiryMinutes < 1 || config.accessTokenExpiryMinutes > 1440) {
        errors.accessTokenExpiryMinutes = 'Access token expiry must be between 1 and 1440 minutes (24 hours)';
      }
    }

    if (config.refreshTokenExpiryDays !== undefined) {
      if (config.refreshTokenExpiryDays < 1 || config.refreshTokenExpiryDays > 90) {
        errors.refreshTokenExpiryDays = 'Refresh token expiry must be between 1 and 90 days';
      }
    }

    if (config.rememberMeTokenExpiryDays !== undefined) {
      if (config.rememberMeTokenExpiryDays < 1 || config.rememberMeTokenExpiryDays > 365) {
        errors.rememberMeTokenExpiryDays = 'Remember me token expiry must be between 1 and 365 days';
      }
    }

    return errors;
  }

  // Format display values for token configuration
  formatTokenConfigDisplay(config: TokenConfigResponse): TokenConfigResponse {
    return {
      ...config,
      accessTokenExpiryDisplay: this.formatMinutesToDisplay(config.accessTokenExpiryMinutes),
      refreshTokenExpiryDisplay: this.formatDaysToDisplay(config.refreshTokenExpiryDays),
      rememberMeTokenExpiryDisplay: this.formatDaysToDisplay(config.rememberMeTokenExpiryDays)
    };
  }

  private formatMinutesToDisplay(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }

  private formatDaysToDisplay(days: number): string {
    if (days === 1) {
      return '1 day';
    }
    
    if (days < 7) {
      return `${days} days`;
    }
    
    if (days % 7 === 0) {
      const weeks = days / 7;
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
    
    if (days < 30) {
      return `${days} days`;
    }
    
    if (days % 30 === 0) {
      const months = days / 30;
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    
    return `${days} days`;
  }
}

// Export singleton instance
export const adminService = new AdminService();
