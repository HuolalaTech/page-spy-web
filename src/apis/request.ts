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

// 重定向到登录页面
const redirectToLogin = () => {
  // 获取哈希部分的路径（#/开头）
  const hash = window.location.hash;
  // 如果有hash就用hash，没有就用pathname
  const currentPath = hash
    ? hash.substring(1)
    : window.location.pathname + window.location.search;
  sessionStorage.setItem('redirect_after_login', currentPath);

  // 判断当前页面是否为受保护页面（已经有ProtectedRoute组件）
  const protectedPaths = ['/room-list', '/log-list', '/devtools', '/replay'];

  // 从hash或pathname中提取路径根部分
  let currentPathRoot = '';
  if (hash && hash.length > 1) {
    // 从hash中提取，如 #/room-list 提取为 /room-list
    currentPathRoot = '/' + hash.substring(2).split('/')[0];
  } else {
    // 从pathname中提取
    currentPathRoot = '/' + window.location.pathname.split('/')[1];
  }

  if (protectedPaths.includes(currentPathRoot)) {
    // 如果当前已经在受保护页面，则刷新页面
    // 刷新后ProtectedRoute组件会自动显示登录界面
    window.location.reload();
  } else {
    // 如果不在受保护页面，则跳转到log-list页面
    window.location.href = '/#/log-list';
  }
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
          // 清除无效的令牌
          localStorage.removeItem('page-spy-auth-token');
          localStorage.removeItem('page-spy-token-expires-at');

          // 获取错误信息
          const errorData = error.data as any;

          // 处理认证令牌未提供的情况
          if (
            errorData &&
            (errorData.code === 'EXPIRED_OR_INVALID_TOKEN' ||
              errorData.code === 'TOKEN_REQUIRED' ||
              errorData.message === 'Authentication token not provided')
          ) {
            console.log('认证失败，需要重新登录');

            // 重定向到登录页面
            redirectToLogin();
          }
        }
      }

      throw error;
    }
  }
}

export default new ApiRequest();
