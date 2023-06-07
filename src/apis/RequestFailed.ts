import { CustomError } from '@huolala-tech/custom-error';
import type { InvokeResult } from '@huolala-tech/request';

export class RequestFailed extends CustomError implements InvokeResult {
  public statusCode: number;
  public data: unknown;
  public headers: Record<string, string>;
  constructor(res: InvokeResult) {
    const { message } = Object(res.data);
    super(message || 'request failed');
    this.statusCode = res.statusCode;
    this.data = res.data;
    this.headers = res.headers;
    this.name = 'RequestFailed';
  }
}
