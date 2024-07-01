import { useLanguage } from '@/utils/useLanguage';
import React, { Suspense, useMemo } from 'react';
import './index.less';
import { Link, useParams } from 'react-router-dom';
import { DOC_MENUS, ORDER_DOC_MENUS, OrderDocMenus } from '../DocMenus';
import { Space, message, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { ReactComponent as BeforeSvg } from '@/assets/image/before.svg';
import { ReactComponent as NextSvg } from '@/assets/image/next.svg';
import Icon from '@ant-design/icons';
import { HeaderLink } from '../HeaderLink';

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

const FooterLink = ({
  menu,
  flag,
}: {
  menu: OrderDocMenus[number] | null;
  flag: 'prev' | 'next';
}) => {
  const [lang] = useLanguage();
  const { t } = useTranslation();
  if (!menu) return null;

  return (
    <Link className="footer-link" to={menu.doc}>
      <div className="footer-link__head">
        {flag === 'prev' && (
          <Icon component={BeforeSvg} style={{ fontSize: 12 }} />
        )}
        <span>{flag === 'prev' ? t('common.prev') : t('common.next')}</span>
        {flag === 'next' && <Icon component={NextSvg} />}
      </div>
      <h4 className="footer-link__title">
        {typeof menu.label === 'string' ? menu.label : menu.label[lang]}
      </h4>
    </Link>
  );
};

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

  const { prev, current, next } = useMemo(() => {
    const navigation: Record<string, OrderDocMenus[number] | null> = {
      prev: null,
      current: null,
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
    navigation.current = ORDER_DOC_MENUS[index];
    return navigation;
  }, [doc]);

  return (
    <main className="doc-content">
      <div className="paragraph">
        <Suspense fallback={<span>Loading</span>}>
          {current && (
            <HeaderLink level={1} slug={current.doc}>
              {typeof current.label === 'string'
                ? current.label
                : current.label[lang]}
            </HeaderLink>
          )}

          {React.createElement(docContent)}
          <div className="navigation">
            <div className="navigation-prev">
              <FooterLink menu={prev} flag="prev" />
            </div>
            <div className="navigation-next">
              <FooterLink menu={next} flag="next" />
            </div>
          </div>
        </Suspense>
      </div>
    </main>
  );
};
