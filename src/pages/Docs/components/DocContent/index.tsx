import { langType, useLanguage } from '@/utils/useLanguage';
import React, { Suspense } from 'react';
import './index.less';
import { useLocation } from 'react-router-dom';
import { DOC_MENUS } from '../DocMenus';

const modules = import.meta.glob('../../md/*.mdx') as Record<string, any>;

const mdComponents = Object.entries(modules).reduce((acc, cur) => {
  const [key, value] = cur;
  const result = key.match(/md\/(.+)\.(.+)\.mdx$/);
  if (!result) return acc;
  const [, doc, lang] = result;
  if (!acc[doc]) {
    acc[doc] = { [lang]: React.lazy(value) };
  } else {
    acc[doc][lang] = React.lazy(value);
  }
  return acc;
}, {} as Record<string, Record<string, React.LazyExoticComponent<any>>>);

export const DocContent = () => {
  const [lang] = useLanguage();
  const { hash } = useLocation();
  const doc = hash?.slice(1) || DOC_MENUS[0].children[0].doc;

  return (
    <div className="doc-content">
      <div className="doc-content__content">
        <Suspense fallback={<span>Loading</span>}>
          {React.createElement(mdComponents[doc][lang])}
        </Suspense>
      </div>
    </div>
  );
};
