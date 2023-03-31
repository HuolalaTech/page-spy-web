import Usage from './md/usage.mdx';
import './index.less';
import { Row, Col } from 'antd';

export const Docs = () => {
  return (
    <div className="docs">
      <Row justify="center">
        <Col span={14}>
          <Usage />
        </Col>
      </Row>
    </div>
  );
};
