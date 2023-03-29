import { resolveProtocol } from '@/utils';
import { extend } from 'umi-request';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE || window.location.host;

export const request = extend({
  prefix: `${resolveProtocol()[0]}${API_BASE_URL}/api/v1`,
  timeout: 30000,
  credentials: 'include',
});
