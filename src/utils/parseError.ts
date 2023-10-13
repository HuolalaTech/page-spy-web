import { getTranslation } from '@/assets/locales';
import { getFileExtension } from '.';
import sh from './shiki-highlighter';
import type { Lang } from 'shiki';

const getI18nText = (k: string) => getTranslation(`console.error-trace.${k}`);

const fileCache = new Map<string, string>();
const readFile = async (url: string) => {
  try {
    if (!url.trim()) return null;

    const cache = fileCache.get(url);
    if (!cache) {
      const res = await fetch(url);
      if (!res.ok) {
        return null;
      }
      const content = await res.text();
      fileCache.set(url, content);
    }
    return fileCache.get(url)!;
  } catch (e) {
    return null;
  }
};

export interface Fragments {
  line: number | null;
  column: number | null;
  start: number | null;
  end: number | null;
  sourceFile: string | null;
  sourceHTML: string | null;
}

const locateSourceCode = (data: {
  sourcemap: string;
  lineNumber: number;
  columnNumber: number;
}): Promise<Fragments> => {
  const { sourcemap, lineNumber, columnNumber } = data;
  return new Promise((resolve) => {
    window.sourceMap.SourceMapConsumer.with(
      sourcemap,
      null,
      async (consumer) => {
        const { line, column, source } = consumer.originalPositionFor({
          line: lineNumber,
          column: columnNumber,
        });
        if (source === null || line === null || column === null) {
          resolve({
            line,
            column,
            start: null,
            end: null,
            sourceFile: source,
            sourceHTML: null,
          });
          return;
        }
        const start = Math.max(line - 5, 0);
        const end = line + 5;
        const list =
          consumer.sourceContentFor(source)?.split('\n').slice(start, end) ||
          [];
        const sourceContent = list.join('\n');
        const lang = getFileExtension(source) || 'js';
        const highlighter = await sh.get({
          lang: lang as Lang,
        });
        const tokens = highlighter.codeToThemedTokens(
          sourceContent,
          lang,
          'github-dark',
        );
        let index = 0;
        const sourceHTML = window.shiki.renderToHtml(tokens, {
          bg: highlighter.getBackgroundColor('github-dark'),
          elements: {
            line({ className, children }) {
              if (index++ === 4) {
                return `<span class="${className} error-line" style="--position: ${column}">${children}</span>`;
              }
              return `<span class="${className}">${children}</span>`;
            },
          },
        });
        resolve({
          line,
          column,
          start: start + 1,
          end: end + 1,
          sourceFile: source,
          sourceHTML,
        });
      },
    );
  });
};

const loadSourceMap = async (filename: string) => {
  let result: string | null = null;

  // hidden sourcemap
  const fakeSourcemapFilename = filename + '.map';
  result = await readFile(fakeSourcemapFilename);
  if (result) return result;

  // inline sourcemap OR standalone sourcemap
  const originFileContent = await readFile(filename);
  if (!originFileContent) {
    throw new Error(getI18nText('fetch-minify-fail')!);
  }
  const inlineContent = originFileContent.match(
    /(?<=\/\/#\s+sourceMappingURL=).*/,
  );
  if (!inlineContent) {
    throw new Error(getI18nText('none-sourcemap')!);
  }
  // inline sourcemap
  let targetUrl = inlineContent[0];
  if (!targetUrl.startsWith('data:application/json;')) {
    // standalone sourcemap
    targetUrl = new URL(targetUrl, filename).toString();
  }
  result = await readFile(targetUrl);
  return result;
};

/**
 * @description 从报错堆栈的文件、行、列反查源码，返回源码片段
 */
export const getOriginFragments = async (data: {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
}) => {
  const { fileName, lineNumber, columnNumber } = data;
  const sourcemap = await loadSourceMap(fileName);

  if (!sourcemap) {
    throw new Error(getI18nText('fetch-sourcemap-fail'));
  }

  const fragments = await locateSourceCode({
    sourcemap,
    lineNumber,
    columnNumber,
  });

  return fragments;
};
