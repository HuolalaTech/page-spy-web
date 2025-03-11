import { SpyConsole } from '@huolala-tech/page-spy-types';
import { useCallback, useRef } from 'react';
import { AutoSizer } from 'react-virtualized';
import { VariableSizeList as List } from 'react-window';
import { ConsoleItem } from './components/ConsoleItem';
import { throttle } from 'lodash-es';
interface Props {
  data: SpyConsole.DataItem[];
}

export const ConsoleList = ({ data }: Props) => {
  const listRef = useRef<List>(null);
  const heights = useRef<Map<number, number>>(new Map());

  const resetAfterIndex = useRef(
    throttle((index: number) => {
      listRef.current?.resetAfterIndex(index, true);
    }, 100),
  );
  const onHeightChange = (index: number, height: number) => {
    heights.current.set(index, height);
    resetAfterIndex.current(index);
  };

  const getItemSize = useCallback((index: number) => {
    return heights.current.get(index) ?? 27;
  }, []);
  return (
    <AutoSizer>
      {({ width, height }) => (
        <List
          ref={listRef}
          width={width}
          height={height}
          itemSize={getItemSize}
          itemCount={data.length}
        >
          {({ index, style }) => {
            const item = data[index];
            return (
              <div style={style} data-index={index} key={item.id}>
                <ConsoleItem
                  data={item}
                  onHeightChange={(height) => onHeightChange(index, height)}
                />
              </div>
            );
          }}
        </List>
      )}
    </AutoSizer>
  );
};
