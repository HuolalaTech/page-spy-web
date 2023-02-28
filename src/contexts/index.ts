import React from 'react';

export const UserContext = React.createContext({
  userInfo: {},
  updateUser(val: any) {
    return val;
  },
});
