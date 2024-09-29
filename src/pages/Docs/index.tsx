import './index.less';
import { DocContent } from './components/DocContent';
import { Sidebar } from './components/Sidebar';
import { Suspense } from 'react';
import { LoadingFallback } from '@/components/LoadingFallback';
import { TransitionContextWrapper } from '@/components/Transition';

const Docs = () => {
  return (
    <div className="docs">
      <Suspense fallback={<LoadingFallback />}>
        <TransitionContextWrapper>
          <Sidebar />
          <DocContent />
        </TransitionContextWrapper>
      </Suspense>
    </div>
  );
};

export default Docs;
