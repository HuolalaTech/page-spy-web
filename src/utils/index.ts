export function getObjectKeys<T extends Record<string, any>>(data: T) {
  return Object.keys(data) as Exclude<keyof T, symbol>[];
}

export function resolveProtocol() {
  const { protocol } = window.location;
  if (protocol.startsWith('https')) {
    return ['https://', 'wss://'];
  }
  return ['http://', 'ws://'];
}
