import {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
  PropsWithChildren,
} from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { requestAuthStatus, requestLogin } from '@/apis';
import { AUTH_FAILED_EVENT, TOKEN_KEY } from '@/apis/request';
import { useEventListener } from './useEventListener';

// 认证上下文定义
interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (password: string) => Promise<boolean>;
  checkStatus: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const AuthProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);

  // 为 true 时存在两种可能：1. 无需密码；2. 认证通过
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  useEventListener(AUTH_FAILED_EVENT, () => setIsAuthenticated(false));

  const setToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    setIsAuthenticated(true);
  };

  const checkStatus = async (): Promise<void> => {
    try {
      setLoading(true);
      // 200
      await requestAuthStatus();
      setIsAuthenticated(true);
    } catch (error: any) {
      // 401
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await requestLogin({ password });
      if (response.success) {
        setToken(response.data.token);
        message.success(t('auth.login_success'));
        return true;
      }

      switch (response.code) {
        case 'INVALID_PASSWORD':
          message.error(t('auth.incorrect_password'));
          break;
        case 'PASSWORD_REQUIRED':
          message.warning(t('auth.need_set_password'));
          break;
        default:
          message.error(response.message || t('auth.login_failed'));
          break;
      }
      return false;
    } catch (error: any) {
      // 处理网络错误等异常情况
      message.error(t('auth.server_error'));
      return false;
    }
  };

  // 初始化时验证令牌
  useEffect(() => {
    checkStatus();
  }, []);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      loading,
      login,
      checkStatus,
    }),
    [isAuthenticated, loading, login],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
