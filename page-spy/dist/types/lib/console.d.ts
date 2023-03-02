export type ProxyType = 'log' | 'info' | 'error' | 'warn';

export type DataType =
  | 'log'
  | 'info'
  | 'error'
  | 'warn'
  | 'debug-origin'
  | 'debug-eval';
export interface DataItem {
  id?: string;
  logType: DataType;
  logs: any[];
  url: string;
  time?: number;
}
