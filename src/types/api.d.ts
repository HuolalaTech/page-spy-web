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
    name: string;
    password: string;
    tag: Record<string, any>;
  }

  export interface SpyRoomList {
    code: number;
    message: string;
    success: boolean;
    data: SpyRoom[];
  }
}
