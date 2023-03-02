export interface RequestInfo {
  id: string;
  name: string;
  method: string;
  url: string;
  requestType: 'xhr' | 'fetch' | 'ping';
  requestHeader: HeadersInit | null;
  status: number | string;
  statusText: string;
  readyState: XMLHttpRequest['readyState'];
  response: any;
  responseReason: string | null;
  responseType: XMLHttpRequest['responseType'];
  responseHeader: Record<string, string> | null;
  startTime: number;
  endTime: number;
  costTime: number;
  getData: Record<string, string> | null;
  postData: Record<string, string> | string | null;
  withCredentials: boolean;
}
