import MouseScrollSvg from '@/assets/image/mouse-scroll.svg?react';
import { HTMLAttributes } from 'react';
import './index.less';

export const MouseTip = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="mouse-tip" {...props}>
      <MouseScrollSvg />
    </div>
  );
};
