const DEBUG_STORAGE_KEY = 'page-spy-debug';

class Debug {
  constructor(
    public readonly enabled: boolean,
    private readonly prefix: string,
  ) {}

  log(...args: unknown[]) {
    if (this.enabled) {
      console.log(`[${this.prefix}]`, ...args);
    }
  }

  error(...args: unknown[]) {
    if (this.enabled) {
      console.error(`[${this.prefix}]`, ...args);
    }
  }

  panic(message: string, ...args: unknown[]) {
    if (this.enabled) {
      this.error(message, ...args);
      throw new Error(`[${this.prefix}] ${message}`);
    }
  }
}

export const debug = new Debug(
  localStorage.getItem(DEBUG_STORAGE_KEY) !== null,
  'PageSpy',
);
