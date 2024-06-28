import { useLanguage } from '@/utils/useLanguage';
import React, { Suspense, useMemo } from 'react';
import './index.less';
import { Link, useParams } from 'react-router-dom';
import { DOC_MENUS, ORDER_DOC_MENUS, OrderDocMenus } from '../DocMenus';
import { message, notification } from 'antd';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [lang] = useLanguage();
  const params = useParams();
  // route match rule "/docs/*"
  const doc = params['*'] || DOC_MENUS[0].children[0].doc;
  const docContent = useMemo(() => {
    const docData = mdComponents[doc][lang];
    if (!docData) {
      notification.error({
        message: t('doc.miss-language')!,
        description: t('doc.miss-desc'),
      });
      return mdComponents[doc]['zh'];
    }
    return docData;
  }, [doc, lang, t]);
  const { prev, next } = useMemo(() => {
    const navigation: Record<'prev' | 'next', OrderDocMenus[number] | null> = {
      prev: null,
      next: null,
    };
    const index = ORDER_DOC_MENUS.findIndex((o) => o.doc === doc);
    if (index < 0) return navigation;
    if (index === 0) {
      navigation.next = ORDER_DOC_MENUS[1];
    } else if (index === ORDER_DOC_MENUS.length - 1) {
      navigation.prev = ORDER_DOC_MENUS[index - 1];
    } else {
      navigation.prev = ORDER_DOC_MENUS[index - 1];
      navigation.next = ORDER_DOC_MENUS[index + 1];
    }
    return navigation;
  }, [doc]);

  return (
    <div className="doc-content">
      <div className="doc-content__content">
        <Suspense fallback={<span>Loading</span>}>
          <>
            {React.createElement(docContent)}
            <div className="doc-footer">
              <div className="doc-footer__prev">
                {prev && (
                  <Link to={prev.doc}>
                    {typeof prev.label === 'string'
                      ? prev.label
                      : prev.label[lang]}
                  </Link>
                )}
              </div>
              <div className="doc-footer__next">
                {next && (
                  <Link to={next.doc}>
                    {typeof next.label === 'string'
                      ? next.label
                      : next.label[lang]}
                  </Link>
                )}
              </div>
            </div>
          </>
        </Suspense>
      </div>
    </div>
  );
};
