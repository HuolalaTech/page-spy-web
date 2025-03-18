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
import { formatSlug } from './utils.mjs';

const root = process.cwd();
const publicDir = path.join(root, 'public');
// /docs/<filename>#<title>
const mainDocDir = path.join(root, 'src/pages/MainDocs/md');
const mainDocFiles = fs.readdirSync(mainDocDir, 'utf-8');
// /o-spy/docs/<filename>#<title>
const oSpyDocDir = path.join(root, 'src/pages/OSpyDocs/md');
const oSpyDocFiles = fs.readdirSync(oSpyDocDir, 'utf-8');

async function findHeading(files, baseDir, baseRoute) {
  const result = [];
  await Promise.all(
    files.map(async (file) => {
      // if (!file.includes('pagespy.zh')) return
      const [, filename, language] = file.match(/^(.+)\.(.+)\.mdx$/);
      const content = fs.readFileSync(path.join(baseDir, file), 'utf-8');

      const processor = unified()
        .use(remarkParse)
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
                  part = {
                    language,
                    route: `${baseRoute}/${filename}#${formatSlug(slug)}`,
                    title: toString(node).replace(/#.+/, ''),
                    content: [],
                  };
                  result.push(part);
                } else if (part) {
                  part.content.push(toString(node));
                }
              }
            });
          });
        });
      const tree = processor.parse(content);
      await processor.run(tree);
    }),
  );
  return result.map((part) => ({
    ...part,
    content: part.content.join(''),
  }));
}

const mainDocResult = await findHeading(mainDocFiles, mainDocDir, '/docs');
const oSpyDocResult = await findHeading(
  oSpyDocFiles,
  oSpyDocDir,
  '/o-spy/docs',
);

const result = [...mainDocResult, ...oSpyDocResult];

fs.writeFileSync(
  path.join(publicDir, 'docs.json'),
  JSON.stringify(result, null, 2),
);
