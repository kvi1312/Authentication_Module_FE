import React, { createContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { tokenService } from '../services/tokenService';
import type {
  AuthState,
  AuthContextType,
  LoginRequest,
  RegisterRequest,
  UserInfo
} from '../types/auth.types';
import { Role } from '../types/auth.types';
import { getEnumFromString } from '../utils/roleUtils';
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  accessToken: null,
  tokenExpiresAt: null,
};
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: UserInfo; accessToken: string; expiresAt?: Date } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        tokenExpiresAt: action.payload.expiresAt || null,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        tokenExpiresAt: null,
        loading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        loading: false,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export { AuthContext };
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const initializeAuth = async () => {
    try {
      const token = tokenService.getAccessToken();
      if (token) {
        const isSessionValid = await authService.validateSession();
        if (isSessionValid) {
          const user = authService.getCurrentUser();
          if (user) {
            const updatedToken = tokenService.getAccessToken(); // Get potentially refreshed token
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user,
                accessToken: updatedToken || token,
              },
            });
          } else {
            tokenService.clearTokens();
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } else {
        const userInfo = authService.getCurrentUser();
        if (userInfo) {
          try {
            const isSessionValid = await authService.validateSession();
            if (isSessionValid) {
              const newToken = tokenService.getAccessToken();
              dispatch({
                type: 'AUTH_SUCCESS',
                payload: {
                  user: userInfo,
                  accessToken: newToken || '',
                },
              });
            } else {
              dispatch({ type: 'AUTH_LOGOUT' });
            }
          } catch {
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      }
    } catch {
      tokenService.clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };
  useEffect(() => {
    initializeAuth();
    const handleAutoLogout = () => {
      dispatch({ type: 'AUTH_LOGOUT' });
    };
    window.addEventListener('auth:logout', handleAutoLogout);
    return () => {
      window.removeEventListener('auth:logout', handleAutoLogout);
    };
  }, []);
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.login(credentials);
      if (response.success && response.accessToken && response.user) {
        const userInfo: UserInfo = {
          ...response.user,
          lastLoginAt: response.user.lastLoginAt ? new Date(response.user.lastLoginAt) : undefined,
          createdDate: new Date(response.user.createdDate)
        };
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: userInfo,
            accessToken: response.accessToken,
          },
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };
  const register = async (userData: RegisterRequest): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authService.register(userData);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch {
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };
  const refreshToken = async (): Promise<boolean> => {
    try {
      const newToken = await authService.refreshToken();
      if (newToken) {
        const user = authService.getCurrentUser();
        if (user) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user,
              accessToken: newToken,
            },
          });
          return true;
        }
      }
      return false;
    } catch {
      dispatch({ type: 'AUTH_LOGOUT' });
      return false;
    }
  };
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };
  const refreshUser = async (): Promise<void> => {
    if (!state.isAuthenticated) return;
    try {
      const userProfile = await authService.fetchCurrentUserFromServer();
      if (userProfile) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: userProfile,
            accessToken: state.accessToken || '',
            expiresAt: state.tokenExpiresAt || undefined,
          },
        });
      }
    } catch (err) {
      console.error('Error sending logout data:', err);
    }
  };
  const updateUserData = (userData: UserInfo): void => {
    if (!state.isAuthenticated) return;
    localStorage.setItem('auth_user_info', JSON.stringify(userData));
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: {
        user: userData,
        accessToken: state.accessToken || '',
        expiresAt: state.tokenExpiresAt || undefined,
      },
    });
  };
  const hasRole = (role: string | Role): boolean => {
    if (!state.isAuthenticated || !state.user) return false;
    let targetRole: Role | null = null;
    if (typeof role === 'string') {
      const roleToCheck = role.toLowerCase();
      if (roleToCheck === 'admin') {
        return state.user.roles.includes(Role.Admin) || state.user.roles.includes(Role.SuperAdmin);
      } else if (roleToCheck === 'superadmin') {
        return state.user.roles.includes(Role.SuperAdmin);
      } else if (roleToCheck === 'partner') {
        return state.user.roles.includes(Role.Partner);
      } else if (roleToCheck === 'customer') {
        return state.user.roles.includes(Role.Customer);
      } else if (roleToCheck === 'manager') {
        return state.user.roles.includes(Role.Manager);
      } else if (roleToCheck === 'employee') {
        return state.user.roles.includes(Role.Employee);
      } else if (roleToCheck === 'guest') {
        return state.user.roles.includes(Role.Guest);
      }
      targetRole = getEnumFromString(roleToCheck);
    } else {
      targetRole = role;
    }
    if (state.user.roles && state.user.roles.length > 0 && targetRole !== null) {
      return state.user.roles.includes(targetRole);
    }
    if (typeof role === 'string') {
      const roleToCheck = role.toLowerCase();
      if (roleToCheck === 'admin') {
        return state.user.userType === 0;
      } else if (roleToCheck === 'partner') {
        return state.user.userType === 1;
      } else if (roleToCheck === 'user') {
        return state.user.userType === 2;
      }
    }
    return false;
  };
  const isAdmin = (): boolean => hasRole('admin');
  const isPartner = (): boolean => hasRole('partner');
  const isEndUser = (): boolean => hasRole('user'); // Changed from 'enduser' to 'user'
  const isRememberMeSession = (): boolean => authService.isRememberMeSession();
  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    refreshUser,
    updateUserData,
    clearError,
    hasRole,
    isAdmin,
    isPartner,
    isEndUser,
    isRememberMeSession,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

