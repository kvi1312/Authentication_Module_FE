import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import type { ApiErrorResponse } from '../types/auth.types';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
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

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          if (!this.refreshPromise) {
            this.refreshPromise = this.refreshToken();
          }

          try {
            await this.refreshPromise;
            this.refreshPromise = null;

            const token = this.getAccessToken();
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }

            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.refreshPromise = null;
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('auth_access_token');
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

  private async refreshToken(): Promise<void> {
    try {
      // Cookie-based refresh - no need to send refresh token in body
      const response = await this.axiosInstance.post('/api/auth/refresh-token', {});
      const refreshData = response.data;
      
      if (refreshData.accessToken) {
        localStorage.setItem('auth_access_token', refreshData.accessToken);
        
        if (refreshData.accessTokenExpiresAt) {
          localStorage.setItem('auth_access_token_expires_at', refreshData.accessTokenExpiresAt);
        }
        
        if (refreshData.refreshTokenExpiresAt) {
          localStorage.setItem('auth_refresh_token_expires_at', refreshData.refreshTokenExpiresAt);
        }
        
        // ✅ UPDATE: Store session type from server response
        if (refreshData.isRememberMe !== undefined) {
          localStorage.setItem('auth_is_remember_me', refreshData.isRememberMe.toString());
        }
      } else {
        throw new Error('No access token in refresh response');
      }
    } catch (error) {
      this.handleAuthFailure();
      throw error;
    }
  }

  private handleAuthFailure(): void {
    // Clear only localStorage data - cookies will be cleared by server
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_access_token_expires_at');
    localStorage.removeItem('auth_refresh_token_expires_at');
    localStorage.removeItem('auth_is_remember_me');
    localStorage.removeItem('auth_user_info');
    
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  public get<T>(url: string) {
    return this.axiosInstance.get<T>(url);
  }

  public post<T>(url: string, data?: unknown) {
    return this.axiosInstance.post<T>(url, data);
  }

  public put<T>(url: string, data?: unknown) {
    return this.axiosInstance.put<T>(url, data);
  }

  public delete<T>(url: string) {
    return this.axiosInstance.delete<T>(url);
  }

  public patch<T>(url: string, data?: unknown) {
    return this.axiosInstance.patch<T>(url, data);
  }
}

export const apiService = new ApiService();