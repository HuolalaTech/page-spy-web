export function getObjectKeys<T extends Record<string, any>>(data: T) {
  return Object.keys(data) as Exclude<keyof T, symbol>[];
}

export function getFileExtension(url: string) {
  const origin = url.trim();
  if (!origin) return '';
  const lastDotIndex = origin.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  return origin.substring(lastDotIndex + 1);
}

export function resolveProtocol() {
  const { protocol } = window.location;
  if (protocol.startsWith('https')) {
    return ['https://', 'wss://'];
  }
  return ['http://', 'ws://'];
}
