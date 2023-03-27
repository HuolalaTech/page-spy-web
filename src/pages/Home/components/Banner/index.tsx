import { ArrowRightOutlined, GithubOutlined } from '@ant-design/icons';
import { Row, Col, Button, Space } from 'antd';
import './index.less';
import { SelectRoom } from '@/components/SelectRoom';
import { Trans, useTranslation } from 'react-i18next';

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
        />
      </defs>
      <g className="moving-waves">
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="1"
          fill="rgba(251,251,251,0.40)"
        />
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="3"
          fill="rgba(251,251,251,0.35)"
        />
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="5"
          fill="rgba(251,251,251,0.25)"
        />
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="8"
          fill="rgba(251,251,251,0.20)"
        />
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="13"
          fill="rgba(251,251,251,0.15)"
        />
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="16"
          fill="rgba(251,251,251,0.95)"
        />
      </g>
    </svg>
  );
};

export const Banner = () => {
  const { t } = useTranslation();

  return (
    <section className="banner flex-center">
      <div style={{ marginBottom: 100 }}>
        <Row justify="center" align="middle">
          <Col>
            <div className="slogan">
              <p>
                <Trans i18nKey="banner.title">
                  One-Stop Online
                  <br />
                  Debug Remote Webpages
                </Trans>
              </p>
            </div>
          </Col>
        </Row>

        <p className="slogan-desc text-center">{t('banner.desc')}</p>

        <Row justify="center" align="middle" className="banner-actions">
          <Col>
            <SelectRoom>
              {({ onPopup }) => {
                return (
                  <Button
                    type="primary"
                    size="large"
                    shape="round"
                    onClick={onPopup}
                  >
                    <Space>
                      {t('banner.goStart')}
                      <ArrowRightOutlined />
                    </Space>
                  </Button>
                );
              }}
            </SelectRoom>
          </Col>
          <Col
            style={{
              marginLeft: 40,
            }}
          >
            <Button size="large" shape="round">
              <Space>
                {t('banner.goGithub')}
                <GithubOutlined style={{ fontSize: 18 }} />
              </Space>
            </Button>
          </Col>
        </Row>
        <Waves />
      </div>
    </section>
  );
};
