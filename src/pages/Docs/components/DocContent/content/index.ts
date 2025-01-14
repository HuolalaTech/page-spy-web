import { langType } from '@/utils/useLanguage';
import React from 'react';
import { DocNotFound } from '../../DocNotFound';

const modules = import.meta.glob('@/pages/Docs/md/*.mdx') as Record<
  string,
  () => Promise<any>
>;

export const LOAD_DOC_EVENT = 'load-doc';

const lazyDocWithNotification =
  (doc: string, value: () => Promise<any>) => async () => {
    window.dispatchEvent(
      new CustomEvent(LOAD_DOC_EVENT, {
        detail: {
          doc,
          loading: true,
        },
      }),
    );
    const result = await value();
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent(LOAD_DOC_EVENT, {
          detail: {
            doc,
            loading: false,
          },
        }),
      );
    }, 100);
    return result;
  };

const mdComponents = Object.entries(modules).reduce((acc, cur) => {
  const [key, value] = cur;
  const result = key.match(/md\/(.+)\.(zh|en|ja|ko)\.mdx$/);
  if (!result) return acc;
  const [, doc, lang] = result;
  const lazyDoc = lazyDocWithNotification(doc, value);
  if (!acc[doc]) {
    acc[doc] = { [lang]: React.lazy(lazyDoc) };
  } else {
    acc[doc][lang] = React.lazy(lazyDoc);
  }
  return acc;
}, {} as Record<string, Record<string, React.LazyExoticComponent<any>>>);

export const getDocContent = (doc: string, lang: langType) => {
  const docData = mdComponents[doc][lang];
  if (!docData) {
    return DocNotFound;
  }
  return docData;
};
