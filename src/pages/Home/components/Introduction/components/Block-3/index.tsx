import { Button, Typography } from 'antd';
import logoImg from '@/assets/image/logo.svg';
import './index.less';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const IntroBlock3 = () => {
  const { t } = useTranslation();

  return (
    <div className="intro-block block-3">
      <div className="welcome-use">
        <img src={logoImg} width="70" alt="LOGO" />
        <Typography.Title level={2}>{t('intro.welcome')}</Typography.Title>
        <Link to="/docs">
          <Button type="primary" shape="round" size="large">
            {t('common.doc')}
          </Button>
        </Link>
      </div>
    </div>
  );
};
