import { apiService } from './api';
import { UserType } from '../types/auth.types';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: UserType;
  roles: string[];
  isActive: boolean;
  createdDate: string;
  lastLoginAt?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface UpdateUserRoleRequest {
  userId: string;
  newUserType: UserType;
  newRoles: string[];
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user?: User;
}

class UserService {
  // User Profile Management (End User)
  async updateProfile(request: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const response = await apiService.put<UpdateProfileResponse>('/api/user/profile', request);
    return response.data;
  }

  async getCurrentProfile(): Promise<User> {
    const response = await apiService.get<{ data: User }>('/api/user/profile');
    return response.data.data;
  }

  // User Management (Admin Only)
  async getAllUsers(): Promise<User[]> {
    const response = await apiService.get<{ data: User[] }>('/api/admin/users');
    return response.data.data;
  }

  async getUserById(userId: string): Promise<User> {
    const response = await apiService.get<{ data: User }>(`/api/admin/users/${userId}`);
    return response.data.data;
  }

  async updateUserRole(request: UpdateUserRoleRequest): Promise<UpdateProfileResponse> {
    const response = await apiService.put<UpdateProfileResponse>(
      `/api/admin/users/${request.userId}/role`, 
      {
        newUserType: request.newUserType,
        newRoles: request.newRoles
      }
    );
    return response.data;
  }

  async deactivateUser(userId: string): Promise<UpdateProfileResponse> {
    const response = await apiService.put<UpdateProfileResponse>(
      `/api/admin/users/${userId}/deactivate`
    );
    return response.data;
  }

  async activateUser(userId: string): Promise<UpdateProfileResponse> {
    const response = await apiService.put<UpdateProfileResponse>(
      `/api/admin/users/${userId}/activate`
    );
    return response.data;
  }

  // Create new admin/partner users (Admin only)
  async createAdminUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    userType: UserType;
    roles: string[];
  }): Promise<UpdateProfileResponse> {
    const response = await apiService.post<UpdateProfileResponse>('/api/admin/users/create', userData);
    return response.data;
  }
}

export const userService = new UserService();
