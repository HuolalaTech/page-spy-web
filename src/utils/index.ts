export function getObjectKeys<T extends Record<string, any>>(data: T) {
  return Object.keys(data) as Exclude<keyof T, symbol>[];
}

export function getFileExtension(url: string) {
  const origin = url.trim();
  if (!origin) return '';
  
  // 移除查询参数
  const pathWithoutQuery = origin.split('?')[0];
  
  const lastDotIndex = pathWithoutQuery.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  
  return pathWithoutQuery.substring(lastDotIndex + 1);
}

export function resolveProtocol() {
  const { protocol } = window.location;
  if (protocol.startsWith('https')) {
    return ['https://', 'wss://'];
  }
  return ['http://', 'ws://'];
  // TODO if web is seperated with backend service, the schema could be different.
}

export const fileToObject = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) return reject(new Error('File not found'));
      const json = JSON.parse(result as string);
      resolve(json);
    };
    reader.readAsText(file);
  });
};

export function getLogUrl(url?: string) {
  if (url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return url;
    }
    try {
      return url.substring(new URL(url).origin.length);
    } catch (e) {
      return '/';
    }
  }
  return '/';
}
