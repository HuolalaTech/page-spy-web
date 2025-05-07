import { default as request } from './request';

// 登录响应结构
export interface LoginResponse {
  token: string;
  expiresAt: number;
}

// 检查认证状态
export const checkAuth = () => {
  return request.get<{ isPasswordSet: boolean }>('/auth/check');
};

// 登录请求
export const login = (password: string) => {
  return request.post<LoginResponse>('/auth/verify', {
    data: { password },
  });
};

// 设置密码
export const setPassword = (password: string) => {
  return request.post<LoginResponse>('/auth/set-password', {
    data: { password },
  });
};

// 检查是否需要密码
export const isPasswordRequired = () => {
  return request.get<{ passwordConfigured: boolean; isFirstStart: boolean }>(
    '/auth/status',
  );
};
