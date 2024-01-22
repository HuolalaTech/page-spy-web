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
    tags: {
      ua?: string;

      [others: string]: any;
    };
  }

  export interface SpyRoomList {
    code: number;
    message: string;
    success: boolean;
    data: SpyRoom[];
  }
}

// Recursive Required
type RRequired<T> = {
  [K in keyof T]-?: T[K] extends Array<infer U>
    ? Array<RRequired<U>>
    : T[K] extends object
    ? RRequired<T[K]>
    : Required<T[K]>;
};
