import React, { createContext, useContext, useReducer } from 'react';
import { adminService } from '../services/adminService';
import type {
  TokenConfigState,
  TokenConfigContextType,
  TokenConfigResponse,
  UpdateTokenConfigRequest
} from '../types/auth.types';

// Initial state
const initialState: TokenConfigState = {
  config: null,
  loading: false,
  error: null,
  isDirty: false,
};

// Action types
type TokenConfigAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: TokenConfigResponse }
  | { type: 'LOAD_FAILURE'; payload: string }
  | { type: 'UPDATE_START' }
  | { type: 'UPDATE_SUCCESS'; payload: TokenConfigResponse }
  | { type: 'UPDATE_FAILURE'; payload: string }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

// Reducer
const tokenConfigReducer = (state: TokenConfigState, action: TokenConfigAction): TokenConfigState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };

    case 'LOAD_SUCCESS':
      return {
        ...state,
        config: action.payload,
        loading: false,
        error: null,
        isDirty: false,
      };

    case 'LOAD_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case 'UPDATE_START':
      return { ...state, loading: true, error: null };

    case 'UPDATE_SUCCESS':
      return {
        ...state,
        config: action.payload,
        loading: false,
        error: null,
        isDirty: false,
      };

    case 'UPDATE_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
};

// Create context
const TokenConfigContext = createContext<TokenConfigContextType | undefined>(undefined);

// Provider component
interface TokenConfigProviderProps {
  children: React.ReactNode;
}

export const TokenConfigProvider: React.FC<TokenConfigProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(tokenConfigReducer, initialState);

  // Load configuration function
  const loadConfig = async (): Promise<void> => {
    dispatch({ type: 'LOAD_START' });

    try {
      const config = await adminService.getTokenConfig();
      const formattedConfig = adminService.formatTokenConfigDisplay(config);
      dispatch({ type: 'LOAD_SUCCESS', payload: formattedConfig });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load token configuration';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Update configuration function
  const updateConfig = async (configUpdate: UpdateTokenConfigRequest): Promise<void> => {
    dispatch({ type: 'UPDATE_START' });

    try {
      // Validate configuration before sending
      const validationErrors = adminService.validateTokenConfig(configUpdate);
      if (Object.keys(validationErrors).length > 0) {
        const errorMessage = Object.values(validationErrors).join(', ');
        throw new Error(errorMessage);
      }

      const response = await adminService.updateTokenConfig(configUpdate);
      
      if (response.success && response.config) {
        const formattedConfig = adminService.formatTokenConfigDisplay(response.config);
        dispatch({ type: 'UPDATE_SUCCESS', payload: formattedConfig });
      } else {
        throw new Error(response.message || 'Failed to update configuration');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update token configuration';
      dispatch({ type: 'UPDATE_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Reset configuration function
  const resetConfig = async (): Promise<void> => {
    dispatch({ type: 'UPDATE_START' });

    try {
      const response = await adminService.resetTokenConfig();
      
      if (response.success && response.config) {
        const formattedConfig = adminService.formatTokenConfigDisplay(response.config);
        dispatch({ type: 'UPDATE_SUCCESS', payload: formattedConfig });
      } else {
        throw new Error(response.message || 'Failed to reset configuration');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to reset token configuration';
      dispatch({ type: 'UPDATE_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Apply preset function
  const applyPreset = async (preset: string): Promise<void> => {
    dispatch({ type: 'UPDATE_START' });

    try {
      const response = await adminService.applyTokenConfigPreset(preset);
      
      if (response.success && response.config) {
        const formattedConfig = adminService.formatTokenConfigDisplay(response.config);
        dispatch({ type: 'UPDATE_SUCCESS', payload: formattedConfig });
      } else {
        throw new Error(response.message || 'Failed to apply preset');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to apply token configuration preset';
      dispatch({ type: 'UPDATE_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Set dirty state
  const setDirty = (dirty: boolean): void => {
    dispatch({ type: 'SET_DIRTY', payload: dirty });
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: TokenConfigContextType = {
    // State
    config: state.config,
    loading: state.loading,
    error: state.error,
    isDirty: state.isDirty,

    // Actions
    loadConfig,
    updateConfig,
    resetConfig,
    applyPreset,

    // Form helpers
    setDirty,
    clearError,
  };

  return (
    <TokenConfigContext.Provider value={contextValue}>
      {children}
    </TokenConfigContext.Provider>
  );
};

// Custom hook to use token config context
export const useTokenConfig = (): TokenConfigContextType => {
  const context = useContext(TokenConfigContext);
  if (context === undefined) {
    throw new Error('useTokenConfig must be used within a TokenConfigProvider');
  }
  return context;
};
