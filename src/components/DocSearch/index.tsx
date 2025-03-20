/* eslint-disable react/no-unknown-property */
import { useEventListener } from '@/utils/useEventListener';
import { Command } from 'cmdk';
import { ReactNode, useMemo, useRef, useState } from 'react';
import './index.less';
import { useTranslation } from 'react-i18next';
import { Flex } from 'antd';
import { throttle, groupBy } from 'lodash-es';
import docRecords from '@/assets/docs.json';
import { useLanguage } from '@/utils/useLanguage';
import Fuse, { FuseResult, FuseResultMatch } from 'fuse.js';
import { OPEN_SEARCH_EVENT } from './OpenDocSearch';
import { useNavigate } from 'react-router-dom';
interface RecordItem {
  language: string;
  route: string;
  title: string;
  content: string;
  parent: string | null;
}

const getContainer = () => {
  let div = document.body.querySelector('#cmdk-search');
  if (!div) {
    div = document.createElement('div');
    div.id = 'cmdk-search';
    document.body.appendChild(div);
  }
  return div as HTMLDivElement;
};

export const DocSearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(getContainer());

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>('');
  const goto = () => {
    setOpen(false);
    navigate(selected);
    setSelected('');
  };
  useEventListener(
    'keydown',
    (e) => {
      const { key, metaKey, ctrlKey } = e as KeyboardEvent;
      if (key === 'k' && (metaKey || ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
        return;
      }
      if (key === 'Enter' && selected) {
        goto();
      }
    },
    { passive: false },
  );
  useEventListener(OPEN_SEARCH_EVENT, () => {
    setOpen(true);
  });

  const [lang] = useLanguage();
  const fuse = useRef<Fuse<RecordItem> | null>(null);
  useMemo(() => {
    const list = docRecords[lang] ?? docRecords.zh;
    if (!fuse.current) {
      fuse.current = new Fuse(list, {
        includeMatches: true,
        minMatchCharLength: 2,
        threshold: 0.3,
        ignoreLocation: true,
        keys: ['content', 'title', 'parent'],
      });
      return;
    }
    fuse.current.setCollection(list);
  }, [lang]);
  const [value, setValue] = useState('');
  const [result, setResult] = useState<
    Record<string, FuseResult<RecordItem>[]>
  >({});
  const search = useRef(
    throttle(
      (value) => {
        if (!fuse.current) return;
        const data = fuse.current.search(value, { limit: 10 });
        const result = groupBy(data, 'item.parent');
        setResult(result);
      },
      1000,
      { leading: true, trailing: true },
    ),
  );

  return (
    <Command.Dialog
      container={ref.current}
      loop
      open={open}
      onOpenChange={(e) => {
        setOpen(e);
      }}
      shouldFilter={false}
      value={selected}
      onValueChange={(v) => {
        setSelected(v);
      }}
    >
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
              <DocSearchItem key={item.refIndex} item={item} onSelect={goto} />
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
const DocSearchItem = ({
  item,
  onSelect,
}: {
  item: FuseResult<RecordItem>;
  onSelect: () => void;
}) => {
  const { route, title, content } = item.item;

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
    <Command.Item key={item.refIndex} value={route} onSelect={onSelect}>
      <div cmdk-item-title="">{computedText.title}</div>
      <div cmdk-item-content="">{computedText.content}</div>
    </Command.Item>
  );
};
