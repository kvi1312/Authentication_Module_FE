import { apiService } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import type { 
  TokenConfigResponse, 
  UpdateTokenConfigRequest, 
  UpdateTokenConfigResponse,
  TokenPresetResponse 
} from '../types/auth.types';

class TokenConfigService {
  async getTokenConfig(): Promise<TokenConfigResponse> {
    try {
      const response = await apiService.get<TokenConfigResponse>(
        API_ENDPOINTS.ADMIN.TOKEN_CONFIG
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: unknown } };
      throw apiError.response?.data || error;
    }
  }

  async updateTokenConfig(config: UpdateTokenConfigRequest): Promise<UpdateTokenConfigResponse> {
    try {
      const response = await apiService.put<UpdateTokenConfigResponse>(
        API_ENDPOINTS.ADMIN.TOKEN_CONFIG,
        config
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: unknown } };
      throw apiError.response?.data || error;
    }
  }

  async resetTokenConfig(): Promise<UpdateTokenConfigResponse> {
    try {
      const response = await apiService.post<UpdateTokenConfigResponse>(
        API_ENDPOINTS.ADMIN.TOKEN_CONFIG_RESET
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: unknown } };
      throw apiError.response?.data || error;
    }
  }

  async applyPreset(preset: string): Promise<UpdateTokenConfigResponse> {
    try {
      const response = await apiService.post<UpdateTokenConfigResponse>(
        API_ENDPOINTS.ADMIN.TOKEN_CONFIG_PRESET(preset)
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: unknown } };
      throw apiError.response?.data || error;
    }
  }

  async getPresets(): Promise<TokenPresetResponse> {
    try {
      const response = await apiService.get<TokenPresetResponse>(
        '/api/admin/token-config/presets'
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: unknown } };
      throw apiError.response?.data || error;
    }
  }
}

export const tokenConfigService = new TokenConfigService();
