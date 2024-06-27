import { useLanguage } from '@/utils/useLanguage';
import { Link, useLocation } from 'react-router-dom';
import './index.less';
import clsx from 'clsx';

export const DOC_MENUS = [
  {
    group: {
      zh: '指引',
      en: 'Guide',
      ja: 'ガイド',
      ko: '가이드',
    },
    children: [
      {
        label: {
          zh: '介绍',
          en: 'Introduction',
          ja: '紹介',
          ko: '소개',
        },
        doc: 'introduction',
      },
    ],
  },
  {
    group: {
      zh: '快速上手',
      en: 'Quick Start',
      ja: 'クイックスタート',
      ko: '빠른 시작',
    },
    children: [
      {
        label: {
          zh: '浏览器',
          en: 'Browser',
          ja: 'ブラウザ',
          ko: '브라우저',
        },
        doc: 'browser',
      },
      {
        label: {
          zh: '小程序',
          en: 'Miniprogram',
          ja: 'ミニプログラム',
          ko: '미니프로그램',
        },
        doc: 'miniprogram',
      },
      {
        label: 'React Native',
        doc: 'react-native',
      },
      {
        label: {
          zh: '鸿蒙 App',
          en: 'Harmony App',
          ja: 'ハーモニーアプリ',
          ko: '하모니 앱',
        },
        doc: 'harmony',
      },
    ],
  },
  {
    group: {
      zh: '关于',
      en: 'About',
      ja: 'について',
      ko: '에 관하여',
    },
    children: [
      {
        label: {
          zh: '插件系统',
          en: 'Plugins',
          ja: 'プラグインシステム',
          ko: '플러그인 시스템',
        },
        doc: 'plugins',
      },
      {
        label: {
          zh: '离线日志回放',
          en: 'Offline Log',
          ja: 'オフラインログ',
          ko: '오프라인 로그',
        },
        doc: 'offline-log',
      },
      {
        label: {
          zh: '常见问题解答',
          en: 'FAQ',
          ja: 'よくある質問',
          ko: '자주 묻는 질문',
        },
        doc: 'faq',
      },
      {
        label: {
          zh: '开发团队',
          en: 'Team',
          ja: '開発チーム',
          ko: '개발 팀',
        },
        doc: 'team',
      },
    ],
  },
];

export const DocMenus = () => {
  const [lang] = useLanguage();
  const { hash } = useLocation();
  const docInUrl = hash?.slice(1) || DOC_MENUS[0].children[0].doc;

  return (
    <div className="doc-menus">
      {DOC_MENUS.map(({ group, children }, index) => {
        return (
          <div className="doc-menus__group" key={index}>
            <h4>{group[lang]}</h4>
            {children.map(({ label, doc }) => {
              return (
                <Link
                  to={`#${doc}`}
                  key={doc}
                  className={clsx({
                    active: docInUrl === doc,
                  })}
                >
                  {typeof label === 'string' ? label : label[lang]}
                </Link>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
