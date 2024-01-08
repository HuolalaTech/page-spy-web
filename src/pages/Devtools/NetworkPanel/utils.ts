import { getObjectKeys } from '@/utils';
import { SpyNetwork } from '@huolala-tech/page-spy/web';

export function downloadFile(filename: string, url: string) {
  const aTag = document.createElement('a');
  aTag.download = filename;
  aTag.href = url;
  document.body.append(aTag);
  aTag.click();
  aTag.remove();
}
export function dataUrlToBlob(data: string) {
  try {
    const arr = data.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const rest = atob(arr[1]);
    let restLen = rest.length;
    const uint8List = new Uint8Array(restLen);
    // eslint-disable-next-line no-plusplus
    while (restLen--) {
      uint8List[restLen] = rest.charCodeAt(restLen);
    }
    return {
      blob: new Blob([uint8List], { type: mime }),
      mime,
    };
  } catch (e) {
    return {
      blob: null,
      mime: null,
      data,
    };
  }
}
export function semanticSize(size: number) {
  if (size < 1024) return `${size} Byte`;
  const oneMB = 1024 * 1024;
  if (size < oneMB) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / oneMB).toFixed(1)} MB`;
}

export function getStatusText(row: SpyNetwork.RequestInfo) {
  if (row.readyState === 0 || row.readyState === 1) return 'Pending';
  if (row.readyState === 4) {
    if (row.status === 0) return 'Failed';
  }
  return row.status;
}

export function getTime(time: number) {
  if (time > 1000) {
    return `${(time / 1000).toFixed(1)} s`;
  }
  return `${time} ms`;
}

export function validValues(value: any) {
  return value !== null && getObjectKeys(value).length > 0 ? value : null;
}

export function validEntries(
  value: [string, string][] | null,
): value is [string, string][] {
  if (value !== null && value.length > 0) return true;
  return false;
}
