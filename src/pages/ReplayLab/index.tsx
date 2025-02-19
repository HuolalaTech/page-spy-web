import './index.less';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Welcome } from './components/Welcome';
import { useStepStore } from './components/store';
import { ReplayInLab } from './components/ReplayInLab';
import '@huolala-tech/page-spy-plugin-whole-bundle/dist/index.css';

const ReplayLab = () => {
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
        content: <ReplayInLab />,
      },
    ];
  }, [t]);

  return (
    <div className="replay-lab">
      <div style={{ height: '100%' }}>{contents[current].content}</div>
    </div>
  );
};

export default ReplayLab;
