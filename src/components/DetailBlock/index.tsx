import React, { ReactNode } from 'react';
import './index.less';

type Props = {
  title?: string | ReactNode;
  children?: ReactNode;
};

const DetailBlock = (props: Props) => {
  return (
    <div className="detail-block">
      <div className="detail-block__label">{props.title}</div>
      <div className="detail-block__content">{props.children}</div>
    </div>
  );
};

export default DetailBlock;
