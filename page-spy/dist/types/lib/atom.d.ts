export interface Overview {
  id: string;
  type:
    | 'string'
    | 'number'
    | 'bigint'
    | 'boolean'
    | 'symbol'
    | 'undefined'
    | 'object'
    | 'function'
    | 'null'
    | 'error'
    | 'debug-origin'
    | 'atom';
  value: string | PropertyDescriptor;
  __atomId?: string;
  instanceId?: string;
}
