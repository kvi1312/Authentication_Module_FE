import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../types/auth.types';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthStatus = () => {
  const { isAuthenticated, loading } = useAuth();
  
  return {
    isAuthenticated,
    loading,
    isReady: !loading,
  };
};

export const useUserInfo = () => {
  const { user, isAuthenticated } = useAuth();
  
  return {
    user,
    isLoggedIn: isAuthenticated && !!user,
    userType: user?.userType,
    roles: user?.roles || [],
    fullName: user?.fullName || '',
  };
};

export const usePermissions = () => {
  const { hasRole, isAdmin, isPartner, isEndUser } = useAuth();
  
  return {
    hasRole,
    isAdmin: isAdmin(),
    isPartner: isPartner(),
    isEndUser: isEndUser(),
    can: (permission: string) => hasRole(permission),
  };
};
