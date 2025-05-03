import { resolveProtocol } from '@/utils';
import { InvokeParams, request } from '@huolala-tech/request';
import { RequestFailed } from './RequestFailed';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE || window.DEPLOY_BASE_PATH;

export interface Options extends Omit<InvokeParams, 'method' | 'url' | 'data'> {
  data?: unknown;
  params?: Record<string, any>;
  prefix?: string;
  requireAuth?: boolean; // 是否需要认证
}

const removeUndefinedValues = (params: unknown) => {
  if (!params) return {};
  if (params instanceof URLSearchParams) {
    return params;
  }
  return JSON.parse(JSON.stringify(params));
};

// 获取存储的认证令牌
const getAuthToken = (): string | null => {
  return localStorage.getItem('page-spy-auth-token');
};

class ApiRequest {
  defaultPrefix = resolveProtocol()[0] + API_BASE_URL + '/api/v1';

  get<T>(path: string, options?: Options) {
    return this.request<T>('GET', path, options);
  }

  post<T>(path: string, options?: Options) {
    return this.request<T>('POST', path, options);
  }

  delete<T>(path: string, options?: Options) {
    return this.request<T>('DELETE', path, options);
  }

  private async request<T>(
    method: string,
    path: string,
    options: Options = {},
  ) {
    const {
      prefix = this.defaultPrefix,
      data,
      params,
      requireAuth = false,
    } = options;
    const qs = new URLSearchParams(removeUndefinedValues(params))
      .toString()
      .replace(/^./, '?$&');
    const url = prefix + path + qs;

    // 设置请求头，如果需要认证则添加认证头
    const headers: Record<string, string> = {};
    if (requireAuth) {
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const res = await request<T>({
        url,
        method,
        data: data as any,
        headers,
        ...options,
      });

      if (res.statusCode >= 200 && res.statusCode < 300) {
        return res.data;
      }

      throw new RequestFailed(res);
    } catch (error) {
      // 处理令牌过期的特殊情况
      if (error instanceof RequestFailed) {
        // 检查是否是因为令牌过期导致的未授权
        if (error.statusCode === 401) {
          // 令牌过期返回的特定错误代码
          const errorData = error.data as any;
          if (errorData && errorData.code === 'EXPIRED_OR_INVALID_TOKEN') {
            console.log('令牌已过期，需要重新登录');

            // 清除无效的令牌
            localStorage.removeItem('page-spy-auth-token');
            localStorage.removeItem('page-spy-token-expires-at');
          }
        }
      }

      throw error;
    }
  }
}

export default new ApiRequest();
