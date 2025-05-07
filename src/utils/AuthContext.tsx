import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import request from '@/apis/request';

// 认证上下文定义
interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  needPasswordSetup: boolean;
  login: (password: string) => Promise<boolean>;
  setPassword: (password: string) => Promise<boolean>;
  skipPasswordSetup: () => Promise<boolean>;
  logout: () => void;
  checkPasswordStatus: () => Promise<void>;
  getAuthToken: () => string | null;
  refreshToken: () => Promise<boolean>;
  expiresAt: number | null;
}

// 创建认证上下文
export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

// 本地存储键名
const TOKEN_KEY = 'page-spy-auth-token';
const EXPIRES_AT_KEY = 'page-spy-token-expires-at';

// 认证上下文提供器
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [needPasswordSetup, setNeedPasswordSetup] = useState<boolean>(false);

  // 设置令牌和过期时间
  const setTokenAndExpiration = (token: string, expiresInSeconds: number) => {
    // 计算过期时间戳
    const expiresAt = Date.now() + expiresInSeconds * 1000;

    // 保存令牌和过期时间
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString());

    // 更新状态
    setExpiresAt(expiresAt);
    setIsAuthenticated(true);
  };

  // 获取存储的认证令牌
  const getAuthToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  };

  // 检查令牌是否有效
  const isTokenValid = (): boolean => {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);

    if (!token || !expiresAt) {
      return false;
    }

    // 检查令牌是否过期
    return parseInt(expiresAt, 10) > Date.now();
  };

  // 检查密码状态
  const checkPasswordStatus = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await request.get<any>('/auth/status');

      if (response && response.success) {
        // 首次启动时 isFirstStart 为 true 且 passwordConfigured 为 false
        // 需要设置密码
        const isFirstStart = response.data.isFirstStart;
        const passwordConfigured = response.data.passwordConfigured;

        // 首次启动需要设置密码
        if (isFirstStart) {
          setNeedPasswordSetup(true);
        } else {
          setNeedPasswordSetup(false);

          // 如果未设置密码但不是首次启动（无密码模式），则直接视为已认证
          if (!passwordConfigured) {
            setIsAuthenticated(true);
          }
        }
      }
    } catch (error) {
      console.error('检查密码状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const login = async (password: string): Promise<boolean> => {
    try {
      // 调用认证接口
      const response = await request.post<any>('/auth/verify', {
        data: { password },
      });

      if (response.success) {
        console.log('登录成功，获取到token:', response.data.token);

        // 登录成功情况
        // 设置令牌和过期时间
        setTokenAndExpiration(
          response.data.token,
          response.data.expiresIn || 86400, // 默认24小时
        );

        // 打印检查token是否已正确设置
        console.log(
          '设置token后，当前token状态:',
          localStorage.getItem(TOKEN_KEY),
        );

        // 更新认证状态
        setIsAuthenticated(true);

        // 清除无密码模式缓存，强制下次重新检查
        sessionStorage.removeItem('page-spy-no-password-mode');

        // 显示登录成功提示
        message.success(t('auth.login_success'));

        // 检查是否有登录后的重定向路径
        const redirectPath = sessionStorage.getItem('redirect_after_login');
        if (redirectPath) {
          // 清除存储的路径
          sessionStorage.removeItem('redirect_after_login');

          // 重定向到之前的页面
          // 如果路径以/开头但不是以/#/开头，则添加#
          if (redirectPath.startsWith('/') && !redirectPath.startsWith('/#/')) {
            window.location.href = '/#' + redirectPath;
          } else {
            window.location.href = redirectPath;
          }
        }

        return true;
      } else {
        // 处理各种登录失败情况
        if (response.code === 'INVALID_PASSWORD') {
          // 密码错误
          message.error(t('auth.incorrect_password'));
        } else if (response.code === 'PASSWORD_REQUIRED') {
          // 密码未设置
          setNeedPasswordSetup(true);
          message.warning(t('auth.need_set_password'));
        } else {
          // 其他错误
          message.error(response.message || t('auth.login_failed'));
        }
        return false;
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      // 处理网络错误等异常情况
      message.error(t('auth.server_error'));
      return false;
    }
  };

  // 设置密码
  const setPassword = async (password: string): Promise<boolean> => {
    try {
      // 调用设置密码接口
      const response = await request.post<any>('/auth/set-password', {
        data: { password },
      });

      if (response.success) {
        // 设置令牌和过期时间
        setTokenAndExpiration(
          response.data.token,
          response.data.expiresIn || 86400, // 默认24小时
        );

        setNeedPasswordSetup(false);
        message.success(t('auth.password_set_success'));

        // 检查是否有登录后的重定向路径
        const redirectPath = sessionStorage.getItem('redirect_after_login');
        if (redirectPath) {
          // 清除存储的路径
          sessionStorage.removeItem('redirect_after_login');

          // 重定向到之前的页面
          // 如果路径以/开头但不是以/#/开头，则添加#
          if (redirectPath.startsWith('/') && !redirectPath.startsWith('/#/')) {
            window.location.href = '/#' + redirectPath;
          } else {
            window.location.href = redirectPath;
          }
        }

        return true;
      } else {
        // 处理设置密码失败的情况
        if (response.code === 'PASSWORD_ALREADY_SET') {
          message.error(t('auth.password_already_set'));
          setNeedPasswordSetup(false);
        } else if (response.code === 'INVALID_PASSWORD') {
          message.error(t('auth.password_too_short'));
        } else if (response.code === 'ENV_PASSWORD_SET') {
          message.error(response.message || t('auth.password_set_failed'));
        } else {
          message.error(t('auth.password_set_failed'));
        }
        return false;
      }
    } catch (error: any) {
      console.error('设置密码失败:', error);
      message.error(t('auth.server_error'));
      return false;
    }
  };

  // 刷新令牌
  const refreshToken = async (): Promise<boolean> => {
    try {
      // 实际项目中，此处应该调用令牌刷新接口
      // 这里简化处理，直接重新登录
      const token = getAuthToken();
      if (!token) {
        return false;
      }

      // 此处应实现令牌刷新逻辑
      return false;
    } catch (error) {
      console.error('刷新令牌失败:', error);
      return false;
    }
  };

  // 跳过密码设置
  const skipPasswordSetup = async (): Promise<boolean> => {
    try {
      // 调用跳过密码设置接口
      const response = await request.post<any>('/auth/skip-password');

      if (response.success) {
        // 跳过密码设置后是无密码模式，直接设为已认证
        setIsAuthenticated(true);
        setNeedPasswordSetup(false);
        message.success(t('auth.skip_password_success'));

        // 检查是否有登录后的重定向路径
        const redirectPath = sessionStorage.getItem('redirect_after_login');
        if (redirectPath) {
          // 清除存储的路径
          sessionStorage.removeItem('redirect_after_login');

          // 重定向到之前的页面
          if (redirectPath.startsWith('/') && !redirectPath.startsWith('/#/')) {
            window.location.href = '/#' + redirectPath;
          } else {
            window.location.href = redirectPath;
          }
        }

        return true;
      } else {
        // 处理跳过密码设置失败的情况
        if (response.code === 'PASSWORD_ALREADY_SET') {
          message.error(t('auth.password_already_set'));
        } else if (response.code === 'ENV_PASSWORD_SET') {
          message.error(response.message || t('auth.skip_password_failed'));
        } else {
          message.error(t('auth.skip_password_failed'));
        }
        return false;
      }
    } catch (error: any) {
      console.error('跳过密码设置失败:', error);
      message.error(t('auth.server_error'));
      return false;
    }
  };

  // 登出
  const logout = () => {
    // 无密码模式下不应该显示登出按钮，但如果调用了登出方法，则简单刷新页面即可
    if (!isTokenValid() && isAuthenticated) {
      window.location.reload();
      return;
    }

    // 清除本地存储的令牌和过期时间
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);

    // 更新状态
    setIsAuthenticated(false);
    setExpiresAt(null);

    // 显示登出成功消息
    message.success(t('auth.logout_success'));

    // 对于哈希路由，刷新当前页面就可以，ProtectedRoute组件会自动显示登录界面
    window.location.reload();
  };

  // 初始化时验证令牌
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      // 检查令牌是否有效
      if (isTokenValid()) {
        setIsAuthenticated(true);
        setExpiresAt(parseInt(localStorage.getItem(EXPIRES_AT_KEY) || '0', 10));
      } else {
        // 清除无效的令牌
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EXPIRES_AT_KEY);
        setIsAuthenticated(false);

        // 检查密码状态
        await checkPasswordStatus();
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // 导出上下文值
  const contextValue: AuthContextType = {
    isAuthenticated,
    loading,
    needPasswordSetup,
    login,
    setPassword,
    skipPasswordSetup,
    logout,
    checkPasswordStatus,
    getAuthToken,
    refreshToken,
    expiresAt,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// 自定义Hook便于使用认证上下文
export const useAuth = () => useContext(AuthContext);

// 默认导出
export default AuthProvider;
