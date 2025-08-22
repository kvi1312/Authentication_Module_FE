import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import type {
  AuthState,
  AuthContextType,
  LoginRequest,
  RegisterRequest,
  UserInfo
} from '../types/auth.types';

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  accessToken: null,
  tokenExpiresAt: null,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: UserInfo; accessToken: string; expiresAt?: Date } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer
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
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        tokenExpiresAt: null,
        loading: false,
        error: null,
      };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = authService.getCurrentUser();
          const accessToken = authService.getCurrentUser();
          
          if (user && accessToken) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user,
                accessToken: accessToken.toString(), // Convert to string if needed
              },
            });
          } else {
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }

        // Initialize auth service
        authService.initializeAuth();
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();

    // Listen for auth events
    const handleAutoLogout = () => {
      dispatch({ type: 'AUTH_LOGOUT' });
    };

    window.addEventListener('auth:logout', handleAutoLogout);

    // Cleanup
    return () => {
      window.removeEventListener('auth:logout', handleAutoLogout);
      authService.cleanup();
    };
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.login(credentials);

      if (response.success && response.user && response.accessToken) {
        const expiresAt = response.expiresAt ? new Date(response.expiresAt) : undefined;
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: {
              ...response.user,
              lastLoginAt: response.user.lastLoginAt ? new Date(response.user.lastLoginAt) : undefined,
              createdDate: new Date(response.user.createdDate),
            },
            accessToken: response.accessToken,
            expiresAt,
          },
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (userData: RegisterRequest): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.register(userData);

      if (response.success) {
        // Registration successful, but user needs to login
        dispatch({ type: 'SET_LOADING', payload: false });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await authService.refreshToken();
      
      if (response.success && response.accessToken) {
        const user = authService.getCurrentUser();
        const expiresAt = response.expiresAt ? new Date(response.expiresAt) : undefined;
        
        if (user) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user,
              accessToken: response.accessToken,
              expiresAt,
            },
          });
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
      return false;
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Utility functions
  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  const isAdmin = (): boolean => {
    return authService.isAdmin();
  };

  const isPartner = (): boolean => {
    return authService.isPartner();
  };

  const isEndUser = (): boolean => {
    return authService.isEndUser();
  };

  const contextValue: AuthContextType = {
    // State
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    loading: state.loading,
    error: state.error,
    accessToken: state.accessToken,
    tokenExpiresAt: state.tokenExpiresAt,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    clearError,

    // Utilities
    hasRole,
    isAdmin,
    isPartner,
    isEndUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
