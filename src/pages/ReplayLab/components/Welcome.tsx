import { Button, Flex, Typography } from 'antd';
import { useStepStore } from './store';

const { Title } = Typography;

export const Welcome = () => {
  const next = useStepStore((state) => state.next);

  return (
    <Flex
      vertical
      justify="center"
      align="center"
      gap={40}
      style={{ height: '100%' }}
    >
      <h1 style={{ textAlign: 'center' }}>
        欢迎来到
        <br />
        回放实验室
      </h1>
      <h5 style={{ textAlign: 'center', letterSpacing: 0.5 }}>
        几行代码，让系统拥有强大的「问题反馈」能力
        <br />
        数据都在本地，不经过网络传输，无需担心隐私泄露
      </h5>
      <Button size="large" onClick={next}>
        <b>立刻体验</b>
      </Button>
    </Flex>
  );
};
