import { langType, useLanguage } from '@/utils/useLanguage';
import { useParams } from 'react-router-dom';
import './index.less';
import clsx from 'clsx';
import { memo } from 'react';
import { TransitionLink } from '@/components/Transition';

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
          zh: '简介',
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
      zh: '服务部署',
      en: 'Deploy',
      ja: 'Deploy',
      ko: 'Deploy',
    },
    children: [
      {
        label: {
          zh: '部署说明',
          en: 'Guide',
          ja: '使用説明',
          ko: '사용 설명',
        },
        doc: 'deploy-guide',
      },
      {
        label: {
          zh: '使用 Node 部署',
          en: 'Deploy with Node',
          ja: 'Node を使用してデプロイ',
          ko: 'Node로 배포',
        },
        doc: 'deploy-with-node',
      },
      {
        label: {
          zh: '使用 Docker 部署',
          en: 'Deploy with Docker',
          ja: 'Docker を使用してデプロイ',
          ko: 'Docker로 배포',
        },
        doc: 'deploy-with-docker',
      },
      {
        label: {
          zh: '使用 宝塔 部署',
          en: 'Deploy with Baota',
          ja: '宝塔を使用してデプロイ',
          ko: 'Baota로 배포',
        },
        doc: 'deploy-with-baota',
      },
      // {
      //   label: {
      //     zh: '使用 1Panel 部署',
      //     en: 'Deploy with 1Panel',
      //     ja: '1Panel を使用してデプロイ',
      //     ko: '1Panel로 배포',
      //   },
      //   doc: 'deploy-with-1panel',
      // },
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
        label: 'API',
        doc: 'api',
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
          zh: '插件系统',
          en: 'Plugins',
          ja: 'プラグインシステム',
          ko: '플러그인 시스템',
        },
        doc: 'plugins',
      },
      {
        label: {
          zh: '版本日志',
          en: 'Changelog',
          ja: 'Changelog',
          ko: 'Changelog',
        },
        doc: 'changelog',
      },
    ],
  },
];

export type OrderDocMenus = {
  doc: string;
  label: string | Record<langType, string>;
  group: Record<langType, string>;
}[];

export const ORDER_DOC_MENUS = DOC_MENUS.reduce((acc, cur) => {
  const { children, group } = cur;
  const menus = children.map((item) => ({ ...item, group }));
  acc.push(...menus);
  return acc;
}, [] as OrderDocMenus);

export const DocMenus = memo(() => {
  const [lang] = useLanguage();
  const params = useParams();
  // route match rule "/docs/*"
  const docInUrl = params['*'] || DOC_MENUS[0].children[0].doc;

  return (
    <div className="doc-menus">
      {DOC_MENUS.map(({ group, children }, index) => {
        return (
          <div className="doc-menus__group" key={index}>
            <h4>{group[lang]}</h4>
            {children.map(({ label, doc }) => {
              return (
                <TransitionLink
                  to={doc}
                  key={doc}
                  className={clsx('menu-item', {
                    active: docInUrl === doc,
                  })}
                >
                  {typeof label === 'string' ? label : label[lang]}
                </TransitionLink>
              );
            })}
          </div>
        );
      })}
    </div>
  );
});
