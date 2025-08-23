import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  adminOnly?: boolean;
  partnerOnly?: boolean;
  endUserOnly?: boolean;
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  adminOnly,
  partnerOnly,
  endUserOnly,
}) => {
  const { isAuthenticated, loading, hasRole, isAdmin, isPartner, isEndUser } = useAuth();
  const location = useLocation();
  if (loading) {
    return <LoadingSpinner />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (partnerOnly && !isPartner()) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (endUserOnly && !isEndUser()) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};
export default ProtectedRoute;

