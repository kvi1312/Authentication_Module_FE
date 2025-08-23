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
  email: string;
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
  async updateProfile(request: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const response = await apiService.put<UpdateProfileResponse>('/api/user/profile', request);
    return response.data;
  }
  async getCurrentProfile(): Promise<User> {
    const response = await apiService.get<{ data: User }>('/api/user/profile');
    return response.data.data;
  }
  async getAllUsers(): Promise<User[]> {
    const response = await apiService.get<{ data: User[] }>('/api/admin/users');
    return response.data.data;
  }
  async getAllUsersWithPagination(params: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    userType?: number;
    roleFilter?: number;
  }): Promise<{
    users: User[];
    totalCount: number;
    success: boolean;
    message: string;
  }> {
    const queryParams = new URLSearchParams();
    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params.userType !== undefined) queryParams.append('userType', params.userType.toString());
    if (params.roleFilter !== undefined) queryParams.append('roleFilter', params.roleFilter.toString());
    const response = await apiService.get<{
      users: User[];
      totalCount: number;
      success: boolean;
      message: string;
    }>(`/api/admin/users?${queryParams.toString()}`);
    return response.data;
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

