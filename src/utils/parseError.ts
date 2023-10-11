import { getTranslation } from '@/assets/locales';
import { getFileExtension } from '.';
import sh from './shiki-highlighter';
import type { Lang } from 'shiki';

const getI18nText = (k: string) => getTranslation(`console.error-trace.${k}`);

const fileCache = new Map<string, string>();
const readFile = async (url: string) => {
  if (!url.trim()) return null;

  const cache = fileCache.get(url);
  if (!cache) {
    const content = await (await fetch(url)).text();
    fileCache.set(url, content);
  }
  return fileCache.get(url);
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
        const highlighter = await sh.get();
        const sourceHTML = highlighter.codeToHtml(sourceContent, {
          lang,
          theme: 'github-dark',
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

/**
 * @description 从报错堆栈的文件、行、列反查源码，返回源码片段
 */
export const getOriginFragments = async (data: {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
}) => {
  const { fileName, lineNumber, columnNumber } = data;
  const minified = await readFile(fileName);
  if (!minified) {
    throw new Error(getI18nText('fetch-minify-fail')!);
  }
  const sourceMapUrl = minified.match(/(?<=\/\/#\s+sourceMappingURL=).*/);
  if (!sourceMapUrl) {
    throw new Error(getI18nText('none-sourcemap')!);
  }
  const sourcemap = await readFile(
    new URL(sourceMapUrl[0], fileName).toString(),
  );
  if (!sourcemap) {
    throw new Error(getI18nText('fetch-sourcemap-fail')!);
  }

  const fragments = await locateSourceCode({
    sourcemap,
    lineNumber,
    columnNumber,
  });

  return fragments;
};
