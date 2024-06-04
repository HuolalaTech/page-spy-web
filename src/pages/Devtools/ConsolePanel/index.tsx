/* eslint-disable no-underscore-dangle */
import './index.less';
import { HeaderActions } from './components/HeaderActions';
import { MainContent } from './components/MainContent';
import { FooterInput } from './components/FooterInput';
import { ErrorDetailDrawer } from './components/ErrorDetailDrawer';
import { useMemo } from 'react';
import { useSocketMessageStore } from '@/store/socket-message';
import MPWarning from '@/components/MPWarning';
import { InfoCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const ConsolePanel = () => {
  const clientInfo = useSocketMessageStore((state) => state.clientInfo);
  const { dynamicalExecutable, isMP, hasEvalPlugin } = useMemo(() => {
    const { os, browser, plugins } = clientInfo || {};
    // TODO 纯血鸿蒙出来后需要额外判断是「鸿蒙上的 APP」
    return {
      isMP: browser?.type.startsWith('mp-'),
      hasEvalPlugin: plugins?.includes('MPEvalPlugin'),
      dynamicalExecutable:
        os?.type !== 'harmony' &&
        (!browser?.type.startsWith('mp-') || plugins?.includes('MPEvalPlugin')),
    };
  }, [clientInfo]);

  const { t } = useTranslation('translation', { keyPrefix: 'devtool' });

  return (
    <div className="console-panel">
      <HeaderActions />
      <div className="console-panel__content">
        <MainContent />
        {dynamicalExecutable && <FooterInput />}
        {isMP && hasEvalPlugin && <MPWarning inline />}
        {isMP && !hasEvalPlugin && (
          <div className="mp-eval-plugin-info">
            <InfoCircleFilled />
            <div>{t('eval-plugin-required')}</div>
          </div>
        )}
      </div>
      <ErrorDetailDrawer />
    </div>
  );
};

export default ConsolePanel;
