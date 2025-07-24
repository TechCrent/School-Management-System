import { useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NotAuthorized } from './NotAuthorized';
import { useAuth } from './layout/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const roleDefaultRoute: Record<string, string> = {
  admin: '/',
  teacher: '/',
  student: '/homework',
  parent: '/homework',
};

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { token, role } = useAuth();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role || '')) {
    // Redirect to role-specific default page if not allowed
    const redirectPath = role && roleDefaultRoute[role] ? roleDefaultRoute[role] : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};