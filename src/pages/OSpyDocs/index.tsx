import Docs from '@/components/Docs';

const sidebar = [
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
      {
        label: {
          zh: '自定义主题',
          en: 'Customize Theme',
          ja: 'カスタムテーマ',
          ko: '사용자 지정 테마',
        },
        doc: 'theme',
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
    ],
  },
];

const mdxComponents = import.meta.glob('./md/*.mdx');
const mdRawContents = import.meta.glob('./md/*.mdx', {
  import: 'default',
  query: '?raw',
}) as Record<string, () => Promise<string>>;

const OSpyDocs = () => {
  return <Docs {...{ sidebar, mdxComponents, mdRawContents }} />;
};

export default OSpyDocs;
