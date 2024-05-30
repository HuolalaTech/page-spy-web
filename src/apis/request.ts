import { resolveProtocol } from '@/utils';
import { InvokeParams, request } from '@huolala-tech/request';
import { RequestFailed } from './RequestFailed';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE || window.DEPLOY_BASE_PATH;

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
  defaultPrefix = 'https://' + API_BASE_URL + '/api/v1';

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
    const url = prefix + path + qs;

    const res = await request<T>({
      url,
      method,
      data: data as any,
      ...options,
    });
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data;
    }
    throw new RequestFailed(res);
  }
}

export default new ApiRequest();
