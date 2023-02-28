import { ArrowRightOutlined, GithubOutlined } from '@ant-design/icons';
import { Row, Col, Button, Space } from 'antd';
import { ReactComponent as LogoSvg } from '@/assets/image/logo.svg';
import './index.less';
import { usePopupRef, withPopup } from '@/utils/withPopup';
import { SelectRoomModal } from './SelectRoomModal';
import { useCallback } from 'react';

const Waves = () => {
  return (
    <svg
      className="waves"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 150 40"
      preserveAspectRatio="none"
      shapeRendering="auto"
    >
      <defs>
        <path
          id="gentle-wave"
          d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
        ></path>
      </defs>
      <g className="moving-waves">
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="1"
          fill="rgba(251,251,251,0.40)"
        ></use>
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="3"
          fill="rgba(251,251,251,0.35)"
        ></use>
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="5"
          fill="rgba(251,251,251,0.25)"
        ></use>
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="8"
          fill="rgba(251,251,251,0.20)"
        ></use>
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="13"
          fill="rgba(251,251,251,0.15)"
        ></use>
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="16"
          fill="rgba(251,251,251,0.95)"
        ></use>
      </g>
    </svg>
  );
};

export const Banner = () => {
  const selectRoomRef = usePopupRef<void, string>();

  const onJoinRoom = useCallback(async () => {
    const room = await selectRoomRef.current?.popup();
  }, [selectRoomRef]);

  return (
    <section className="banner flex-center">
      <div style={{ marginBottom: 100 }}>
        <Row justify="center" align="middle">
          <Col>
            <div className="slogan">
              <p>PageSpy</p>
              <p>
                Online Debug
                <br />
                Remote Web
              </p>
            </div>
          </Col>
          <Col
            style={{
              marginLeft: 120,
            }}
          >
            <LogoSvg className="big-logo" />
          </Col>
        </Row>

        <p className="slogan-desc text-center">
          Clear bugs easily with @huolala-tech/page-spy tools whick like
          function panels in devtool.
        </p>

        <Row justify="center" align="middle" className="banner-actions">
          <Col>
            <Button
              type="primary"
              size="large"
              shape="round"
              onClick={onJoinRoom}
            >
              <Space>
                Start debugging
                <ArrowRightOutlined />
              </Space>
            </Button>
          </Col>
          <Col
            style={{
              marginLeft: 40,
            }}
          >
            <Button size="large" shape="round">
              <Space>
                View on GitHub
                <GithubOutlined style={{ fontSize: 18 }} />
              </Space>
            </Button>
          </Col>
        </Row>
        <Waves />
      </div>
      <SelectRoomModal ref={selectRoomRef} />
    </section>
  );
};
