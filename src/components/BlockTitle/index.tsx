import { Typography } from 'antd';
import type { TitleProps } from 'antd/lib/typography/Title';
import './index.less';

const { Title } = Typography;

export const BlockTitle = ({
  title,
  level = 3,
}: {
  title: React.ReactNode;
  level?: TitleProps['level'];
}) => {
  return (
    <div className="block-title">
      <Title level={level} style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
        {title}
      </Title>
    </div>
  );
};
