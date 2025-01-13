import './index.less';
import { useMemo } from 'react';
import { useThreshold } from '@/utils/useThreshold';
import { useTranslation } from 'react-i18next';
import { Welcome } from './components/Welcome';
import Icon from '@ant-design/icons';
import { Flex } from 'antd';
import PrevSvg from '@/assets/image/prev.svg?react';
import NextSvg from '@/assets/image/next.svg?react';
import { useStepStore } from './components/store';
import { ImportPackage } from './components/ImportPackage';

const ReplayLab = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'lab' });
  const isMobile = useThreshold();
  const { current, prev, next } = useStepStore();

  const contents = useMemo(() => {
    return [
      {
        title: '欢迎',
        content: <Welcome />,
      },
      {
        title: '安装',
        content: <ImportPackage />,
      },
      {
        title: '回放',
        content: null,
      },
    ];
  }, []);

  return (
    <div className="replay-lab">
      {isMobile ? (
        <h2>{t('only-pc')}</h2>
      ) : (
        <>
          {contents[current].content}
          <Flex className="step-actions" gap={8}>
            <Icon
              component={PrevSvg}
              style={{ fontSize: 32 }}
              disabled={current === 0}
              onClick={prev}
            />
            <b>
              {current + 1} - {contents[current].title}
            </b>
            <Icon
              component={NextSvg}
              style={{ fontSize: 32 }}
              disabled={current === contents.length - 1}
              onClick={next}
            />
          </Flex>
        </>
      )}
    </div>
  );
};

export default ReplayLab;
