export type DataType = 'local' | 'session' | 'cookie';
export type ActionType = 'clear' | 'remove' | 'get' | 'set';
interface DataItem {
  type: DataType;
  action: ActionType;
  key?: string;
  value?: string;
}
