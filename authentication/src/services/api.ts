import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import type { ApiErrorResponse } from '../types/auth.types';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // Include cookies for refresh tokens
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && originalRequest) {
          // Try to refresh token
          try {
            await this.refreshToken();
            // Retry original request with new token
            const token = this.getAccessToken();
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private getAccessToken(): string | null {
    // This will be implemented by the token service
    return localStorage.getItem('auth_access_token');
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await this.axiosInstance.post('/api/auth/refresh-token');
      const { accessToken, expiresAt } = response.data;
      
      if (accessToken) {
        localStorage.setItem('auth_access_token', accessToken);
        if (expiresAt) {
          localStorage.setItem('auth_token_expires_at', expiresAt);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  private handleAuthFailure(): void {
    // Clear tokens and redirect to login
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_token_expires_at');
    localStorage.removeItem('auth_user_info');
    
    // Dispatch custom event to notify auth context
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  private handleApiError(error: AxiosError): ApiErrorResponse {
    if (error.response?.data) {
      return error.response.data as ApiErrorResponse;
    }

    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      statusCode: error.response?.status || 500,
    };
  }

  // Public methods for making API calls
  public get<T>(url: string) {
    return this.axiosInstance.get<T>(url);
  }

  public post<T>(url: string, data?: any) {
    return this.axiosInstance.post<T>(url, data);
  }

  public put<T>(url: string, data?: any) {
    return this.axiosInstance.put<T>(url, data);
  }

  public delete<T>(url: string) {
    return this.axiosInstance.delete<T>(url);
  }

  public patch<T>(url: string, data?: any) {
    return this.axiosInstance.patch<T>(url, data);
  }
}

// Export singleton instance
export const apiService = new ApiService();
