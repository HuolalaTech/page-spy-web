import { Row, Col, Typography } from 'antd';
import debugImg from '@/assets/image/inspect.png';
import { Trans, useTranslation } from 'react-i18next';

const { Title } = Typography;

export const IntroBlock1 = () => {
  const { t } = useTranslation();
  return (
    <Row gutter={80} justify="center">
      <Col>
        <img width="400" src={debugImg} alt="" />
      </Col>
      <Col style={{ textAlign: 'right' }}>
        <p className="small-title">{t('intro.does')}</p>
        <Title level={1} className="big-title">
          <Trans i18nKey="intro.doesTitle">
            Inspect Runtime, <br />
            Remote!
          </Trans>
        </Title>
      </Col>
    </Row>
  );
};
