import { getTranslation } from '@/assets/locales';
import { getFileExtension } from '.';
import sh from './shiki-highlighter';
import type { Lang } from 'shiki';

const getI18nText = (k: string) => getTranslation(`console.error-trace.${k}`);

const fileCache = new Map<string, { type: string; content: string }>();
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
      const type = res.headers.get('content-type') ?? '';
      fileCache.set(url, {
        type,
        content,
      });
    }
    return fileCache.get(url)!;
  } catch (e) {
    return null;
  }
};

const locateJsSource = (data: {
  sourcemap: string;
  lineNumber: number;
  columnNumber: number;
}): Promise<{
  line: number;
  column: number;
  source: string;
  content: string;
}> => {
  const { sourcemap, lineNumber, columnNumber } = data;
  return new Promise((resolve, reject) => {
    window.sourceMap.SourceMapConsumer.with(sourcemap, null, (consumer) => {
      const { line, column, source, name } = consumer.originalPositionFor({
        line: lineNumber,
        column: columnNumber,
      });
      if (!line || !column || !source) {
        return reject(new Error(getI18nText('failed-title')));
      }

      resolve({
        line,
        column,
        source,
        content: consumer.sourceContentFor(source)!,
      });
    });
  });
};

const loadSourceMap = async (filename: string) => {
  let result: string | null = null;
  const { content } = (await readFile(filename))!;

  // inline sourcemap OR standalone sourcemap
  const inlineContent = content.match(/(?<=\/\/#\s+sourceMappingURL=).*/);
  if (!inlineContent) {
    // hidden sourcemap
    const fakeSourcemapFilename = filename + '.map';
    result = (await readFile(fakeSourcemapFilename))?.content || null;
  } else {
    // inline sourcemap
    let targetUrl = inlineContent[0];
    if (!targetUrl.startsWith('data:application/json;')) {
      // standalone sourcemap
      targetUrl = new URL(targetUrl, filename).toString();
    }
    result = (await readFile(targetUrl))?.content || null;
  }

  return result;
};

const langRegex = /^.*\/([^;]+)/;
const highlightCode = async (data: {
  type: string;
  line: number;
  column: number;
  source: string;
  content: string;
}) => {
  const { type, source, line, column, content } = data;
  const start = Math.max(line - 5, 0);
  const end = line + 5;
  const list = content.split('\n').slice(start, end);

  const useTabs = list.some((i) => i.startsWith('\t'));
  const slicedContent = list.join('\n');
  const lang = (type.match(langRegex)?.[1] as Lang) || 'js';
  const highlighter = await sh.get({
    lang,
  });
  const tokens = highlighter.codeToThemedTokens(
    slicedContent,
    lang,
    'github-dark',
  );
  let index = 0;
  
  if (!window.shiki) {
    throw new Error('Shiki is not loaded yet');
  }
  
  const highlightedHTML = window.shiki.renderToHtml(tokens, {
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

  return {
    line,
    column,
    start: start + 1,
    end: end + 1,
    source,
    highlightedHTML,
    useTabs,
  };
};

/**
 * @description 从报错堆栈的文件、行、列反查源码，返回源码片段
 */
export const getOriginFragments = async (data: Required<StackFrame>) => {
  const { fileName, lineNumber, columnNumber } = data;
  const originFile = await readFile(fileName);
  if (!originFile) {
    throw new Error(getI18nText('fetch-minify-fail')!);
  }
  const { type, content } = originFile;
  if (!type.includes('javascript')) {
    return highlightCode({
      type,
      source: fileName,
      content,
      line: lineNumber,
      column: columnNumber,
    });
  }

  const sourcemap = await loadSourceMap(fileName);

  if (!sourcemap) {
    throw new Error(getI18nText('fetch-sourcemap-fail'));
  }

  const fragments = await locateJsSource({
    sourcemap,
    lineNumber,
    columnNumber,
  });
  return highlightCode({
    type,
    ...fragments,
  });
};
