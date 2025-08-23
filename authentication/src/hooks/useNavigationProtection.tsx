import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useNavigationProtection = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const handleBrowserNavigation = () => {
      const currentPath = location.pathname;
      if (isAuthenticated && (currentPath === '/login' || currentPath === '/register')) {
        navigate('/dashboard', { replace: true });
        return;
      }
      if (!isAuthenticated) {
        const protectedPaths = ['/dashboard', '/admin', '/profile', '/partner'];
        if (protectedPaths.some(path => currentPath.startsWith(path))) {
          navigate('/login', { replace: true });
          return;
        }
      }
    };
    handleBrowserNavigation();
    const handlePopState = () => {
      setTimeout(handleBrowserNavigation, 0);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, location.pathname, navigate]);
  useEffect(() => {
    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate(location.pathname, { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);
};

export const NavigationProtector: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useNavigationProtection();
  return <>{children}</>;
};

