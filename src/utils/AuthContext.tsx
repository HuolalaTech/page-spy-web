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
import { isClient, isDoc } from './constants';
import { useRequest } from 'ahooks';

// 认证上下文定义
interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (password: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const AuthProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { t } = useTranslation();

  // 为 true 时存在几种可能
  // 1. 无需密码
  // 2. 认证通过
  // 3. 构建文档 (yarn build:doc)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    isDoc ? true : false,
  );
  useEventListener(AUTH_FAILED_EVENT, () => setIsAuthenticated(false));

  const { loading: autoVerifyLoading } = useRequest(requestAuthStatus, {
    ready: isClient,
    onSuccess: () => {
      setIsAuthenticated(true);
    },
    onError: () => {
      setIsAuthenticated(false);
    },
  });

  const { loading: loginLoading, runAsync: login } = useRequest(
    async (password: string): Promise<boolean> => {
      try {
        const response = await requestLogin({ password });
        if (response.success) {
          localStorage.setItem(TOKEN_KEY, response.data.token);
          setIsAuthenticated(true);
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
    },
    {
      manual: true,
    },
  );

  const contextValue = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      loading: autoVerifyLoading || loginLoading,
      login,
    }),
    [isAuthenticated, autoVerifyLoading, loginLoading, login],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
