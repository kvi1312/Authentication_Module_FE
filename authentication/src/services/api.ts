import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import type { ApiErrorResponse } from '../types/auth.types';

class ApiService {
  private axiosInstance: AxiosInstance;

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
      (error: AxiosError) => {
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