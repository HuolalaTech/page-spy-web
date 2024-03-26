/* eslint-disable no-underscore-dangle */
import './index.less';
import { HeaderActions } from './components/HeaderActions';
import { MainContent } from './components/MainContent';
import { FooterInput } from './components/FooterInput';
import { ErrorDetailDrawer } from './components/ErrorDetailDrawer';
import { useClientInfoFromMsg } from '@/utils/brand';

const ConsolePanel = () => {
  const clientInfo = useClientInfoFromMsg();
  return (
    <div className="console-panel">
      <HeaderActions />
      <div className="console-panel__content">
        <MainContent />
        <FooterInput />
      </div>
      <ErrorDetailDrawer />
    </div>
  );
};

export default ConsolePanel;
