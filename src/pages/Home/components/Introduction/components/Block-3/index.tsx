import { Button, Typography } from 'antd';
import logoImg from '@/assets/image/logo.svg';
import './index.less';
import { useTranslation } from 'react-i18next';
import { SelectRoom } from '@/components/SelectRoom';

export const IntroBlock3 = () => {
  const { t } = useTranslation();

  return (
    <div className="welcome-use">
      <img src={logoImg} width="70" alt="LOGO" />
      <Typography.Title level={2}>{t('intro.welcome')}</Typography.Title>
      <SelectRoom>
        {({ onPopup }) => (
          <Button type="primary" shape="round" size="large" onClick={onPopup}>
            {t('intro.goStart')}
          </Button>
        )}
      </SelectRoom>
    </div>
  );
};
