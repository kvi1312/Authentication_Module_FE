import { useAuth } from '../contexts/AuthContext';

// Re-export useAuth hook for convenience
export { useAuth } from '../contexts/AuthContext';

// Additional auth-related hooks can be added here
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
