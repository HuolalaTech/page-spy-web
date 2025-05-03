import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '@/utils/AuthContext';
import AuthLogin from '../AuthLogin';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 如果正在加载认证状态，显示加载中
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // 如果未认证，显示登录组件
  if (!isAuthenticated) {
    // 登录组件内部处理密码设置功能
    return <AuthLogin />;
  }

  // 已认证，显示子组件
  return <>{children}</>;
};

export default ProtectedRoute;
