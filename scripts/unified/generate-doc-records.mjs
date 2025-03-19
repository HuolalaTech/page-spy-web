/**
 * @import {Root} from 'hast'
 */
import fs from 'node:fs';
import path from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';
import { remarkMdxCodeGroup } from './custom-plugin.mjs';
import { formatSlug } from './utils.mjs';
import { mergeWith } from 'lodash-es';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
const root = process.cwd();
const outputDir = path.join(root, 'src/assets');
// /docs/<filename>#<title>
const mainDocDir = path.join(root, 'src/pages/MainDocs/md');
const mainDocFiles = fs.readdirSync(mainDocDir, 'utf-8');
const mainDocMenus = new Map([
  [
    'introduction',
    {
      zh: '简介',
      en: 'Introduction',
      ja: '紹介',
      ko: '소개',
    },
  ],
  [
    'deploy-guide',
    {
      zh: '部署说明',
      en: 'Guide',
      ja: '使用説明',
      ko: '사용 설명',
    },
  ],
  [
    'deploy-with-node',
    {
      zh: '使用 Node 部署',
      en: 'Deploy with Node',
      ja: 'Node を使用してデプロイ',
      ko: 'Node로 배포',
    },
  ],
  [
    'deploy-with-docker',
    {
      zh: '使用 Docker 部署',
      en: 'Deploy with Docker',
      ja: 'Docker を使用してデプロイ',
      ko: 'Docker로 배포',
    },
  ],
  [
    'deploy-with-baota',
    {
      zh: '使用 宝塔 部署',
      en: 'Deploy with Baota',
      ja: '宝塔を使用してデプロイ',
      ko: 'Baota로 배포',
    },
  ],
  [
    'browser',
    {
      zh: '浏览器',
      en: 'Browser',
      ja: 'ブラウザ',
      ko: '브라우저',
    },
  ],
  [
    'miniprogram',
    {
      zh: '小程序',
      en: 'Miniprogram',
      ja: 'ミニプログラム',
      ko: '미니프로그램',
    },
  ],
  ['react-native', 'React Native'],
  [
    'harmony',
    {
      zh: '鸿蒙 App',
      en: 'Harmony App',
      ja: 'ハーモニーアプリ',
      ko: '하모니 앱',
    },
  ],
  ['api', 'API'],
  ['pagespy', 'Pagespy'],
  ['data-harbor', 'DataHarborPlugin'],
  ['rrweb', 'RRWebPlugin'],
  [
    'offline-log',
    {
      zh: '离线日志回放',
      en: 'Offline Log',
      ja: 'オフラインログ',
      ko: '오프라인 로그',
    },
  ],
  [
    'faq',
    {
      zh: '常见问题解答',
      en: 'FAQ',
      ja: 'よくある質問',
      ko: '자주 묻는 질문',
    },
  ],
  [
    'plugins',
    {
      zh: '插件系统',
      en: 'Plugins',
      ja: 'プラグインシステム',
      ko: '플러그인 시스템',
    },
  ],
  [
    'changelog',
    {
      zh: '版本日志',
      en: 'Changelog',
      ja: 'Changelog',
      ko: 'Changelog',
    },
  ],
]);
// /o-spy/docs/<filename>#<title>
const oSpyDocDir = path.join(root, 'src/pages/OSpyDocs/md');
const oSpyDocFiles = fs.readdirSync(oSpyDocDir, 'utf-8');
const oSpyDocMenus = new Map([
  [
    'introduction',
    {
      zh: '简介',
      en: 'Introduction',
      ja: '紹介',
      ko: '소개',
    },
  ],
  [
    'theme',
    {
      zh: '自定义主题',
      en: 'Customize Theme',
      ja: 'カスタムテーマ',
      ko: '사용자 지정 테마',
    },
  ],
  [
    'faq',
    {
      zh: '常见问题解答',
      en: 'FAQ',
      ja: 'よくある質問',
      ko: '자주 묻는 질문',
    },
  ],
]);

async function computeDocRecords({ files, baseDir, menus, baseRoute }) {
  const result = {
    en: [],
    zh: [],
    ja: [],
    ko: [],
  };
  await Promise.all(
    files.map(async (file) => {
      // if (!file.includes('pagespy.zh')) return
      const [, filename, language] = file.match(/^(.+)\.(.+)\.mdx$/);
      const content = fs.readFileSync(path.join(baseDir, file), 'utf-8');

      const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkDirective)
        .use(remarkMdxCodeGroup)
        .use(remarkRehype)
        .use(() => (tree) => {
          visit(tree, 'root', (root) => {
            let part = null;
            root.children.forEach((node) => {
              if (node.type === 'element') {
                if (/h\d/.test(node.tagName)) {
                  let slug = '';
                  const customSlug = node.children.findLast(
                    (child) =>
                      child.type === 'text' && child.value.includes('#'),
                  );
                  if (!customSlug) {
                    slug = node.children.find(
                      (child) => child.type === 'text',
                    )?.value;
                  } else {
                    slug = customSlug.value.split('#')[1];
                  }
                  const label = menus.get(filename);
                  if (!label) {
                    throw new Error(`${filename} not found in menus`);
                  }
                  const parent = label
                    ? typeof label === 'string'
                      ? label
                      : label[language]
                    : null;

                  part = {
                    language,
                    route: `${baseRoute}/${filename}#${formatSlug(slug)}`,
                    parent,
                    title: toString(node).replace(/#.+/, ''),
                    content: '',
                  };
                  result[language].push(part);
                } else if (part) {
                  part.content += toString(node);
                }
              }
            });
          });
        });
      const tree = processor.parse(content);
      await processor.run(tree);
    }),
  );
  return result;
}

try {
  const mainDocResult = await computeDocRecords({
    files: mainDocFiles,
    baseDir: mainDocDir,
    menus: mainDocMenus,
    baseRoute: '/docs',
  });
  const oSpyDocResult = await computeDocRecords({
    files: oSpyDocFiles,
    baseDir: oSpyDocDir,
    menus: oSpyDocMenus,
    baseRoute: '/o-spy/docs',
  });

  const result = mergeWith(mainDocResult, oSpyDocResult, (a, b) => {
    return a.concat(b);
  });

  // console.log(result);

  fs.writeFileSync(
    path.join(outputDir, 'docs.json'),
    JSON.stringify(result, null, 2),
  );
  console.log('🟢 The ./src/assets/docs.json doc records generated.');
} catch (e) {
  console.error(`🔴 Error: ${e.message}`);
}
