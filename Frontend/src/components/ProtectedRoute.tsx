import { useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NotAuthorized } from './NotAuthorized';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { t } = useTranslation();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole || '')) {
    return <NotAuthorized />;
  }

  return <>{children}</>;
};