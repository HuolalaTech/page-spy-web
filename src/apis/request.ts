import { resolveProtocol } from '@/utils';
import { InvokeParams, request } from '@huolala-tech/request';
import { RequestFailed } from './RequestFailed';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE || window.DEPLOY_BASE_PATH;

export const TOKEN_KEY = 'page-spy-auth-token';
export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};
export const AUTH_FAILED_EVENT = 'auth-failed';

export interface Options extends Omit<InvokeParams, 'method' | 'url' | 'data'> {
  data?: unknown;
  params?: Record<string, any>;
  prefix?: string;
}

const removeUndefinedValues = (params: unknown) => {
  if (!params) return {};
  if (params instanceof URLSearchParams) {
    return params;
  }
  return JSON.parse(JSON.stringify(params));
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
    const { prefix = this.defaultPrefix, data, params } = options;
    const qs = new URLSearchParams(removeUndefinedValues(params))
      .toString()
      .replace(/^./, '?$&');
    let url = prefix + path + qs;

    try {
      // if path is a complete URL, use it directly
      url = new URL(path).toString();
    } catch (e) {
      // do nothing
    }

    const headers: Record<string, string> = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

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

    if (res.statusCode === 401) {
      window.dispatchEvent(new CustomEvent(AUTH_FAILED_EVENT));
    }

    throw new RequestFailed(res);
  }
}

export default new ApiRequest();
