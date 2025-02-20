import { Row, Col, Button } from 'antd';
import './index.less';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import QuickStartSvg from '@/assets/image/quick-start.svg?react';
import TakeTrySvg from '@/assets/image/take-try.svg?react';
import Icon from '@ant-design/icons';

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

        <div className="banner-actions">
          <Link to="/docs">
            <Button
              type="primary"
              size="large"
              icon={<Icon component={QuickStartSvg} style={{ fontSize: 20 }} />}
            >
              <b>{t('banner.get-start')}</b>
            </Button>
          </Link>
          <Link to="/replay-lab">
            <Button
              size="large"
              icon={<Icon component={TakeTrySvg} style={{ fontSize: 20 }} />}
            >
              <b>{t('banner.take-try')}</b>
            </Button>
          </Link>
        </div>
        <Waves />
      </div>
    </section>
  );
};
