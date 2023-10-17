import './index.less';
import { useLanguage } from '@/utils/useLanguage';
import type { langType } from '@/utils/useLanguage';
import React, { Suspense } from 'react';

const modules = import.meta.glob('./md/*.mdx') as Record<string, any>;
const mdComponents = Object.entries(modules).reduce((acc, cur) => {
  const [key, value] = cur;
  const result = key.match(/usage-(.*)\.mdx$/);
  if (!result) return acc;
  const lang = result[1] as langType;
  acc[lang] = React.lazy(value);
  return acc;
}, {} as Record<langType, React.LazyExoticComponent<any>>);

export const Docs = () => {
  const [lang] = useLanguage();

  return (
    <div className="docs">
      <div className="docs-content">
        <Suspense fallback={<span>Loading</span>}>
          {React.createElement(mdComponents[lang])}
        </Suspense>
      </div>
    </div>
  );
};
