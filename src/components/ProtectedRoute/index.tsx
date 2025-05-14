import React, { ReactNode } from 'react';
import { useAuth } from '@/utils/AuthContext';
import AuthLogin from '../AuthLogin';
import { LoadingFallback } from '../LoadingFallback';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  // 如果未认证，显示登录组件
  if (!isAuthenticated) {
    return <AuthLogin />;
  }

  // 已认证，显示子组件
  return children;
};

export default ProtectedRoute;
