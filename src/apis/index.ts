import { default as request } from './request';

export const getSpyRoom = (group: string) => {
  return request.get<I.SpyRoomList>(`/room/list`, {
    params: {
      group,
    },
  });
};
