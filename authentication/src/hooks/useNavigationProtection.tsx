import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Hook to handle navigation protection
 * Prevents users from going back to login/register after authentication
 * and prevents accessing protected routes after logout
 */
export const useNavigationProtection = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBrowserNavigation = () => {
      const currentPath = location.pathname;
      
      // If user is authenticated and tries to access login/register
      if (isAuthenticated && (currentPath === '/login' || currentPath === '/register')) {
        navigate('/dashboard', { replace: true });
        return;
      }

      // If user is not authenticated and tries to access protected routes
      if (!isAuthenticated) {
        const protectedPaths = ['/dashboard', '/admin', '/profile', '/partner'];
        if (protectedPaths.some(path => currentPath.startsWith(path))) {
          navigate('/login', { replace: true });
          return;
        }
      }
    };

    // Handle initial page load
    handleBrowserNavigation();

    // Handle browser back/forward button
    const handlePopState = () => {
      setTimeout(handleBrowserNavigation, 0);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, location.pathname, navigate]);

  // Disable browser back button for specific scenarios
  useEffect(() => {
    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
      // Replace current entry in history to prevent going back to login after auth
      navigate(location.pathname, { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);
};

/**
 * Component to wrap routes that need navigation protection
 */
export const NavigationProtector: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useNavigationProtection();
  return <>{children}</>;
};
