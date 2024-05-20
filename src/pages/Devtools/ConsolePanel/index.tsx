/* eslint-disable no-underscore-dangle */
import './index.less';
import { HeaderActions } from './components/HeaderActions';
import { MainContent } from './components/MainContent';
import { FooterInput } from './components/FooterInput';
import { ErrorDetailDrawer } from './components/ErrorDetailDrawer';
import { useClientInfoFromMsg } from '@/utils/brand';
import { useMemo } from 'react';

const ConsolePanel = () => {
  const clientInfo = useClientInfoFromMsg();
  const dynamicalExecutable = useMemo(() => {
    const { os } = clientInfo || {};
    // // TODO 纯血鸿蒙出来后需要额外判断是「鸿蒙上的 APP」
    // return os?.type !== 'harmony';
    return true;
  }, [clientInfo]);

  return (
    <div className="console-panel">
      <HeaderActions />
      <div className="console-panel__content">
        <MainContent />
        {dynamicalExecutable && <FooterInput />}
      </div>
      <ErrorDetailDrawer />
    </div>
  );
};

export default ConsolePanel;
