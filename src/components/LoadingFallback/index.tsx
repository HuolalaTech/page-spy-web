import { Spin, SpinProps } from 'antd';
import './index.less';

export const LoadingFallback = ({
  style = {},
}: {
  style?: SpinProps['style'];
}) => {
  return (
    <div className="loading-fallback">
      <Spin style={style} />
    </div>
  );
};
