import './index.less';
import { DocContent } from './components/DocContent';
import { Sidebar } from './components/Sidebar';

export const Docs = () => {
  return (
    <div className="docs">
      <Sidebar />
      <DocContent />
    </div>
  );
};
