/* eslint-disable no-case-declarations */
import data from '@/assets/docs.json';
import type { langType } from '@/utils/useLanguage';
import Fuse from 'fuse.js';
import { groupBy } from 'lodash-es';

export interface RecordItem {
  language: string;
  route: string;
  title: string;
  content: string;
  parent: string | null;
}

let fuse: Fuse<RecordItem>;

const init = (lang: langType) => {
  const list = (data[lang] ?? data.zh).filter(
    (i) => i.title.trim() && i.content.trim(),
  );
  if (!fuse) {
    fuse = new Fuse(list, {
      includeMatches: true,
      minMatchCharLength: 2,
      threshold: 0.3,
      ignoreLocation: true,
      keys: ['content', 'title', 'parent'],
    });
    return;
  }
  fuse.setCollection(list);
};

const search = (keyword: string) => {
  if (!fuse) {
    console.warn('Fuse worker not ready.');
    return;
  }
  const data = fuse.search(keyword, { limit: 20 });
  const result = groupBy(data, 'item.parent');
  return result;
};

interface InitData {
  type: 'init';
  lang: langType;
}

interface SearchData {
  type: 'search';
  keyword: string;
}

type EventData = InitData | SearchData;

addEventListener('message', ({ data }: MessageEvent<EventData>) => {
  const { type } = data;
  switch (type) {
    case 'init':
      init(data.lang);
      break;
    case 'search':
      const result = search(data.keyword);
      postMessage({
        type: 'result',
        result,
      });
      break;
    default:
      break;
  }
});

export interface SearchResultData {
  type: 'result';
  result: ReturnType<typeof search>;
}

export type WorkerResponse = SearchResultData;
