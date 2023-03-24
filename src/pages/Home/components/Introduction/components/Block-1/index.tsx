import { Row, Col, Typography } from 'antd';
import debugImg from '@/assets/image/debugger.png';

const { Title } = Typography;

export const IntroBlock1 = () => {
  return (
    <Row gutter={60}>
      <Col>
        <img width="500" src={debugImg} alt="" />
      </Col>
      <Col style={{ textAlign: 'right' }}>
        <p className="small-title">What PageSpy do</p>
        <Title level={1} className="big-title">
          Inspect Runtime, <br />
          Remote!
        </Title>
      </Col>
    </Row>
  );
};
