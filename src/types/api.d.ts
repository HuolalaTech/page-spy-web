declare namespace I {
  export interface SpyConnection {
    address: string;
    name: string;
    userId: string;
  }
  export interface SpyRoom {
    createdAt: string;
    activeAt: string;
    connections: SpyConnection[];
    address: string;
    group: string;
    name: string; // TODO this `name` is used for browser and os info, should be reconsidered.
    password: string;
    tags: Record<string, any>;
  }

  export interface SpyLog {
    createdAt: string;
    updatedAt: string;
    status: 'Created' | 'Saved' | 'Error' | 'Unknown';
    size: number;
    fileId: string;
    name: string;
    tags: Record<string, any>;
  }

  interface Response<T> {
    code: number;
    message: string;
    success: boolean;
    data: T;
  }

  export type SpyRoomList = Response<SpyRoom[]>;

  export type SpyLogList = Response<{
    total: number;
    data: SpyLog[];
  }>;
}

// Recursive Required
type RRequired<T> = {
  [K in keyof T]-?: T[K] extends Array<infer U>
    ? Array<RRequired<U>>
    : T[K] extends object
    ? RRequired<T[K]>
    : Required<T[K]>;
};
