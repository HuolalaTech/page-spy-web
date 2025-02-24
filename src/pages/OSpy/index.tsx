import './index.less';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Welcome } from './components/Welcome';
import { useStepStore } from './components/store';
import { Replayer } from './components/Replayer';

export const OSpy = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'lab' });
  const { current } = useStepStore();

  const contents = useMemo(() => {
    return [
      {
        title: t('welcome'),
        content: <Welcome />,
      },
      {
        title: t('replay'),
        content: <Replayer />,
      },
    ];
  }, [t]);

  return <div className="o-spy">{contents[current].content}</div>;
};
