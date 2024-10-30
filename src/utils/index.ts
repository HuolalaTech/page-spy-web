import type { RequestItem } from '@huolala-tech/page-spy-base';
import {
  EventType,
  eventWithTime,
  IncrementalSource,
  mouseInteractionData,
  MouseInteractions,
} from '@rrweb/types';
import { isString } from 'lodash-es';

export function getObjectKeys<T extends Record<string, any>>(data: T) {
  return Object.keys(data) as Exclude<keyof T, symbol>[];
}

export function getFileExtension(url: string) {
  const origin = url.trim();
  if (!origin) return '';

  // 移除查询参数
  const pathWithoutQuery = origin.split('?')[0];

  const ext = pathWithoutQuery.match(/\.([^.\/\\]+)$/);

  return ext?.[1];
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

export interface ResolvedUrlInfo {
  name: string;
  pathname: string;
  getData: [string, string][] | null;
}
export function resolveUrlInfo(url: string): ResolvedUrlInfo {
  if (isString(url) && url.startsWith('data:')) {
    return {
      name: url,
      pathname: '',
      getData: null,
    };
  }
  try {
    const { searchParams, pathname } = new URL(url);

    // https://exp.com => "exp.com/"
    // https://exp.com/ => "exp.com/"
    // https://exp.com/devtools => "devtools"
    // https://exp.com/devtools/ => "devtools/"
    // https://exp.com/devtools?version=Mac/10.15.7 => "devtools?version=Mac/10.15.7"
    // https://exp.com/devtools/?version=Mac/10.15.7 => "devtools/?version=Mac/10.15.7"
    const name = url.replace(/^.*?([^/]+)(\/)*(\?.*?)?$/, '$1$2$3') || '';

    return {
      name,
      pathname,
      getData: [...searchParams.entries()],
    };
  } catch (e) {
    return {
      name: url,
      pathname: '',
      getData: null,
    };
  }
}

export type ResolvedNetworkInfo = RequestItem & ResolvedUrlInfo;

interface RRWebClickEvent {
  type: EventType.IncrementalSnapshot;
  data: mouseInteractionData & {
    type: MouseInteractions.Click;
  };
  timestamp: number;
  delay?: number;
}
export const isRRWebClickEvent = (event: unknown): event is RRWebClickEvent => {
  const { type, data } = event as eventWithTime;
  if (
    type === EventType.IncrementalSnapshot &&
    data.source === IncrementalSource.MouseInteraction &&
    data.type === MouseInteractions.Click
  ) {
    return true;
  }

  return false;
};
