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

export function resolveUrlInfo(target: URL | string, base?: string | URL) {
  try {
    let url: string;
    let query: [string, string][];

    const { searchParams, href, origin, pathname } = new URL(target, base);
    url = href;
    query = [...searchParams.entries()];

    // https://exp.com => "exp.com/"
    // https://exp.com/ => "exp.com/"
    // https://exp.com/devtools => "devtools"
    // https://exp.com/devtools/ => "devtools/"
    // https://exp.com/devtools?version=Mac/10.15.7 => "devtools?version=Mac/10.15.7"
    // https://exp.com/devtools/?version=Mac/10.15.7 => "devtools/?version=Mac/10.15.7"
    const name = url.replace(/^.*?([^/]+)(\/)*(\?.*?)?$/, '$1$2$3') || '';

    return {
      url,
      name,
      query,
      rawUrl: origin + pathname,
    };
  } /* c8 ignore start */ catch (e) {
    return {
      url: 'Unknown',
      name: 'Unknown',
      query: null,
      rawUrl: 'Unknown',
    };
  } /* c8 ignore stop */
}
