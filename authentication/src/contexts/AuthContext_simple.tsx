import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { tokenService } from '../services/tokenService';
import type {
  AuthState,
  AuthContextType,
  LoginRequest,
  RegisterRequest,
  UserInfo
} from '../types/auth.types';

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const initializeAuth = async () => {
    try {
      const token = tokenService.getAccessToken();
      if (token && !tokenService.isTokenExpired()) {
        const user = authService.getCurrentUser();
        if (user) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user,
              accessToken: token,
            },
          });
        } else {
          tokenService.clearTokens();
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } else {
        tokenService.clearTokens();
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch {
      tokenService.clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.login(credentials);

      if (response.success && response.accessToken && response.user) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.user,
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
      // Continue with logout even if API call fails
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

  const hasRole = (role: string): boolean => {
    if (!state.isAuthenticated || !state.user) return false;
    
    if (role.toLowerCase() === 'admin') {
      return state.user.userType === 0;
    } else if (role.toLowerCase() === 'partner') {
      return state.user.userType === 1;
    } else if (role.toLowerCase() === 'enduser') {
      return state.user.userType === 2;
    }
    
    return false;
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isPartner = (): boolean => hasRole('partner');
  const isEndUser = (): boolean => hasRole('enduser');

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    hasRole,
    isAdmin,
    isPartner,
    isEndUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
