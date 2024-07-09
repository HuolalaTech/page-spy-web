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
}) => {
  return request.get<I.SpyLogList>(`/log/list`, {
    params: {
      size: 10,
      ...params,
    },
  });
};

export const deleteSpyLog = (params: { fileId: string }) => {
  return request.delete<I.SpyLogList>(`/log/delete`, {
    params,
  });
};

export const checkRoomSecret = (params: {
  address: string;
  secret: string;
}) => {
  return request.get<I.Response<any>>('/room/check', {
    params,
  });
};
