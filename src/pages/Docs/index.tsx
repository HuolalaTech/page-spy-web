import './index.less';
import { DocContent } from './components/DocContent';
import { Sidebar } from './components/Sidebar';
import { Suspense } from 'react';
import { LoadingFallback } from '@/components/LoadingFallback';

export const Docs = () => {
  return (
    <div className="docs">
      <Suspense fallback={<LoadingFallback />}>
        <Sidebar />
        <DocContent />
      </Suspense>
    </div>
  );
};
