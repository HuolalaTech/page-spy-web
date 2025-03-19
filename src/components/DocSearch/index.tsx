/* eslint-disable react/no-unknown-property */
import { useEventListener } from '@/utils/useEventListener';
import { Command } from 'cmdk';
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import './index.less';
import { useTranslation } from 'react-i18next';
import { Flex } from 'antd';
import { throttle, groupBy } from 'lodash-es';
import docRecords from '@/assets/docs.json';
import { useLanguage } from '@/utils/useLanguage';
import Fuse, { FuseResult, FuseResultMatch } from 'fuse.js';

interface RecordItem {
  language: string;
  route: string;
  title: string;
  content: string;
  parent: string | null;
}

export const DocSearch = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  useEventListener('keydown', (e) => {
    const { key, metaKey, ctrlKey } = e as KeyboardEvent;
    if (key === 'k' && (metaKey || ctrlKey)) {
      e.preventDefault();
      setOpen((open) => !open);
    }
  });

  const [lang] = useLanguage();
  const fuse = useMemo(() => {
    return new Fuse(docRecords[lang] ?? docRecords.zh, {
      includeMatches: true,
      minMatchCharLength: 2,
      keys: ['title', 'content'],
    });
  }, [lang]);
  const [value, setValue] = useState('');
  const [result, setResult] = useState<
    Record<string, FuseResult<RecordItem>[]>
  >({});
  const search = useRef(
    throttle(
      (value) => {
        const data = fuse.search(value).slice(0, 50);
        const result = groupBy(data, 'item.parent');
        console.log(data, result);
        setResult(result);
      },
      1000,
      { leading: true, trailing: true },
    ),
  );

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} shouldFilter={false}>
      <Command.Input
        placeholder={t('docSearch.placeholder')!}
        value={value}
        onValueChange={(v) => {
          setValue(v);
          search.current(v);
        }}
      />
      <hr cmdk-raycast-loader="" />
      <Command.List>
        <Command.Empty>{t('docSearch.empty')}</Command.Empty>

        {Object.entries(result).map(([parent, items]) => (
          <Command.Group key={parent} heading={parent}>
            {items.map((item) => (
              <DocSearchItem key={item.refIndex} item={item} />
            ))}
          </Command.Group>
        ))}
      </Command.List>
      <Flex align="center" justify="space-between" gap={8} cmdk-footer="">
        <div cmdk-open-trigger="">
          <kbd>↵</kbd>
          <span>Go</span>
        </div>
        <div cmdk-open-trigger="">
          <kbd>↓</kbd>
          <kbd>↑</kbd>
          <span>Select</span>
        </div>
        <div cmdk-open-trigger="">
          <kbd>esc</kbd>
          <span>Close</span>
        </div>
      </Flex>
    </Command.Dialog>
  );
};

const EXTRA_SIZE = 8;
const DocSearchItem = ({ item }: { item: FuseResult<RecordItem> }) => {
  const { route, parent, title, content } = item.item;

  const computedText = useMemo(() => {
    if (!item.matches) return { title, content };
    const matchTitle = item.matches.find((m) => m.key === 'title');
    const matchContent = item.matches.find((m) => m.key === 'content');

    const sliceText = (match: FuseResultMatch) => {
      if (!match.indices || !match.value) return [];
      const { indices, value } = match;
      const [start, end] = indices[0];
      return [
        start - EXTRA_SIZE > 0 && '...',
        value.slice(Math.max(0, start - EXTRA_SIZE), start),
        <b key={start} cmdk-item-match="">
          {`${value.slice(start, end + 1)}`}
        </b>,
        value.slice(end + 1),
      ];
    };

    let _title: ReactNode[] = [title];
    let _content: ReactNode[] = [content];
    if (matchTitle) {
      _title = sliceText(matchTitle);
    }
    if (matchContent) {
      _content = sliceText(matchContent);
    }
    return { title: _title, content: _content };
  }, [content, item.matches, title]);

  return (
    <Command.Item key={item.refIndex} value={route}>
      <div cmdk-item-title="">{computedText.title}</div>
      <div cmdk-item-content="">{computedText.content}</div>
    </Command.Item>
  );
};
