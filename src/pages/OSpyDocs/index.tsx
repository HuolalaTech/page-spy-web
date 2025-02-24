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
