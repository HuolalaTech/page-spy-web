import React from 'react';
import './index.less';

type Props = {};

const MPSystemPanel = (props: Props) => {
  return (
    <div className="mp-system-panel">
      <div className="mp-info"></div>
      <div className="mp-auth"></div>
      <div className="mp-methods"></div>
    </div>
  );
};

export default MPSystemPanel;
