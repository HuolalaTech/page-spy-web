import EmptySvg from '@/assets/image/empty.svg';
import './index.less';
import { Empty, Button } from 'antd';

export const DocNotFound = () => {
  return (
    <Empty
      image={EmptySvg}
      imageStyle={{ height: 120 }}
      description={
        <p style={{ color: '#ababab' }}>
          Translation not found, welcome to submit PR!
        </p>
      }
    >
      <Button
        type="primary"
        href="https://github.com/HuolalaTech/page-spy-web/tree/main/src/pages/Docs/md"
        target="_blank"
        style={{ color: '#cdcdcd', textDecoration: 'none' }}
      >
        Go to PR
      </Button>
    </Empty>
  );
};
