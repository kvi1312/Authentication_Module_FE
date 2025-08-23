import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spin } from 'antd';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = cần login, false = cần logout (for auth pages)
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo 
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // For protected routes (dashboard, etc.) - require authentication
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // For auth pages (login, register) - redirect if already authenticated
  if (!requireAuth && isAuthenticated) {
    const defaultRedirect = '/dashboard';
    const targetPath = redirectTo || defaultRedirect;
    
    return (
      <Navigate 
        to={targetPath} 
        replace // Important: replace history to prevent back navigation
      />
    );
  }

  // Allow access
  return <>{children}</>;
};

export default AuthGuard;
