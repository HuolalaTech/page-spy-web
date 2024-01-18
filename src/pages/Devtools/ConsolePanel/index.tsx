/* eslint-disable no-underscore-dangle */
import './index.less';
import { HeaderActions } from './components/HeaderActions';
import { MainContent } from './components/MainContent';
import { FooterInput } from './components/FooterInput';
import { ErrorDetailDrawer } from './components/ErrorDetailDrawer';
import { useClientInfo } from '@/utils/brand';

const ConsolePanel = () => {
  const systemInfo = useClientInfo();
  return (
    <div className="console-panel">
      <HeaderActions />
      <div className="console-panel__content">
        <MainContent />
        {!systemInfo?.browserName?.startsWith('mp-') && <FooterInput />}
      </div>
      <ErrorDetailDrawer />
    </div>
  );
};

export default ConsolePanel;
