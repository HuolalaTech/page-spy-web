import { extend } from 'umi-request';

export const API_BASE_URL = import.meta.env.VITE_API_BASE;

export const request = extend({
  prefix: `https://${API_BASE_URL}`,
  timeout: 30000,
  credentials: 'include',
});
