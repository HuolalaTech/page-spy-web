import { Typography } from 'antd';
import debugImg from '@/assets/image/inspect.png';
import { Trans, useTranslation } from 'react-i18next';

const { Title } = Typography;

export const IntroBlock1 = () => {
  const { t } = useTranslation();
  return (
    <div className="intro-block block-1">
      <img width="400" src={debugImg} alt="" />
      <div className="intro-block__title">
        <p className="small-title">{t('intro.does')}</p>
        <Title level={1} className="big-title">
          <Trans i18nKey="intro.doesTitle">
            Inspect Runtime, <br />
            Remote!
          </Trans>
        </Title>
      </div>
    </div>
  );
};
