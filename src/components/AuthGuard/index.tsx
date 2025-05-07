import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/auth-context';
import AuthModal from '../AuthModal';
import { Spin } from 'antd';
import './index.less';

interface AuthGuardProps {
  children: React.ReactNode;
  path: string;
}

// 需要保护的路由路径
const PROTECTED_PATHS = ['/room-list', '/log-list'];

const AuthGuard: React.FC<AuthGuardProps> = ({ children, path }) => {
  const { isLoggedIn, isPasswordSet, isCheckingAuth, isPasswordRequired } =
    useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'setPassword'>('login');

  // 判断是否需要保护此路由
  const needsProtection = PROTECTED_PATHS.some((protectedPath) =>
    path.startsWith(protectedPath),
  );

  useEffect(() => {
    // 如果正在检查认证状态，不做任何处理
    if (isCheckingAuth) {
      return;
    }

    // 如果路径需要保护
    if (needsProtection) {
      // 情况1: 如果未设置密码，显示设置密码模态框
      if (isPasswordRequired === false || isPasswordSet === false) {
        setModalMode('setPassword');
        setShowAuthModal(true);
      }
      // 情况2: 如果设置了密码但未登录，显示登录模态框
      else if (isPasswordRequired === true && !isLoggedIn) {
        setModalMode('login');
        setShowAuthModal(true);
      }
      // 情况3: 已登录或不需要密码，直接显示内容
      else {
        setShowAuthModal(false);
      }
    }
  }, [
    isLoggedIn,
    isPasswordSet,
    isCheckingAuth,
    isPasswordRequired,
    needsProtection,
  ]);

  if (isCheckingAuth) {
    return (
      <div className="auth-guard-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {children}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            // 登录模态框不能关闭，必须登录
            if (modalMode === 'login' && isPasswordRequired && !isLoggedIn) {
              return;
            }
            // 设置密码模态框不能关闭，必须设置密码
            if (modalMode === 'setPassword' && !isPasswordSet) {
              return;
            }
            setShowAuthModal(false);
          }}
          mode={modalMode}
        />
      )}
    </>
  );
};

export default AuthGuard;
