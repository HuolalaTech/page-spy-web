import { Row, Col, Button, Typography } from 'antd';
import logoImg from '@/assets/image/logo.svg';
import './index.less';

export const IntroBlock3 = () => {
  return (
    <div className="welcome-use">
      <img src={logoImg} width="70" alt="LOGO" />
      <Typography.Title level={2}>Welcome to use PageSpy</Typography.Title>
      <Button type="primary" shape="round" size="large">
        Get Started
      </Button>
    </div>
  );
};
