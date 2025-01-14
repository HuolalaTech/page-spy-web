import { default as request } from './request';

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
