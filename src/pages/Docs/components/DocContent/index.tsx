import { useLanguage } from '@/utils/useLanguage';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import './index.less';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { DOC_MENUS, ORDER_DOC_MENUS, OrderDocMenus } from '../DocMenus';
import { notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { ReactComponent as BeforeSvg } from '@/assets/image/before.svg';
import { ReactComponent as NextSvg } from '@/assets/image/next.svg';
import { ReactComponent as MenuSvg } from '@/assets/image/menu.svg';
import Icon from '@ant-design/icons';
import { HeaderLink } from '../HeaderLink';
import { useEventListener } from '@/utils/useEventListener';
import { useSidebarStore } from '@/store/doc-sidebar';
import { useShallow } from 'zustand/react/shallow';
import { TransitionContext } from '@/components/Transition';

const modules = import.meta.glob('../../md/*.mdx') as Record<string, any>;

const LOAD_DOC_EVENT = 'load-doc';
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
  const result = key.match(/md\/(.+)\.(.+)\.mdx$/);
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

const FooterLink = ({
  menu,
  flag,
}: {
  menu: OrderDocMenus[number] | null;
  flag: 'prev' | 'next';
}) => {
  const [lang] = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { startTransition } = useContext(TransitionContext);

  if (!menu) return null;

  return (
    <div
      className="footer-link"
      onClick={() => {
        startTransition(() => {
          navigate(menu.doc);
        });
      }}
    >
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
    </div>
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

  const rootRef = useRef<HTMLElement | null>(null);
  // 侧边/底部导航：切换文档，处理状态过渡
  const { inTransition } = useContext(TransitionContext);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (inTransition) {
      el.classList.add('loading');
    } else {
      el.classList.remove('loading');
    }
  }, [inTransition]);

  const { hash } = useLocation();
  const scrollIntoAnchor = useCallback(() => {
    if (!hash) return;
    rootRef.current?.querySelector(hash)?.scrollIntoView({
      block: 'center',
    });
  }, [hash]);
  useEventListener(LOAD_DOC_EVENT, (e) => {
    const { detail } = e as CustomEvent;
    if (detail.loading === false) {
      scrollIntoAnchor();
    }
  });
  // 点击锚点
  useEffect(scrollIntoAnchor, [scrollIntoAnchor]);

  const setShow = useSidebarStore(useShallow((state) => state.setShow));
  const onCallSidebar = () => {
    setShow(true);
  };

  return (
    <main className="doc-content" ref={rootRef}>
      <div className="paragraph">
        <div className="content">
          {current && (
            <HeaderLink level={1} slug={current.doc}>
              {typeof current.label === 'string'
                ? current.label
                : current.label[lang]}
            </HeaderLink>
          )}

          {React.createElement(docContent, { key: doc })}
        </div>
        <div className="navigation">
          <div className="navigation-prev">
            <FooterLink menu={prev} flag="prev" />
          </div>
          <div className="navigation-menus" onClick={onCallSidebar}>
            <Icon component={MenuSvg} style={{ color: '#999', fontSize: 24 }} />
          </div>
          <div className="navigation-next">
            <FooterLink menu={next} flag="next" />
          </div>
        </div>
      </div>
    </main>
  );
};
