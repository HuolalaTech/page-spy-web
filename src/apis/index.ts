import { default as request } from './request';
import demo from './demo.json?url';

export const getSpyRoom = (group: string = '') => {
  return request.get<I.SpyRoomList>(`/room/list`, {
    params: group?.trim()
      ? {
          group,
        }
      : {},
  });
};

export const getSpyLogs = (params: {
  project?: string;
  title?: string;
  roomId?: string;
  page: number;
  size: number;
}) => {
  return request.get<I.SpyLogList>(`/log/list`, {
    params: {
      ...params,
    },
  });
};

export const deleteSpyLog = (fileIds: string[]) => {
  const params = Object.values(fileIds).reduce((acc, cur) => {
    acc.append('fileId', cur);
    return acc;
  }, new URLSearchParams());
  return request.delete<I.SpyLogList>(`/log/delete?${params.toString()}`);
};

export const checkRoomSecret = (params: {
  address: string;
  secret: string;
}) => {
  return request.get<I.Response<any>>('/room/check', {
    params,
  });
};

export const requestAuthStatus = () => {
  return request.get<I.Response<{ passwordConfigured: boolean }>>(
    '/auth/status',
  );
};

export const requestLogin = (data: { password: string }) => {
  return request.post<I.AuthVerifyResult>('/auth/verify', {
    data,
  });
};

export const requestGetLogFileContent = async (url: string) => {
  // for OSpy demo
  if (url === 'demo') {
    return await (await fetch(demo)).json();
  }
  // for files not served by PageSpy, like S3 resource
  if (!url.includes(request.defaultPrefix)) {
    return await (await fetch(url)).json();
  }
  return request.get<any>(url);
};
