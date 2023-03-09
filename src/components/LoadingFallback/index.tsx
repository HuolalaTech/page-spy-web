import { Spin } from 'antd';
import './index.less';

export const LoadingFallback = () => {
  return (
    <div className="loading-fallback">
      <Spin />
    </div>
  );
};
