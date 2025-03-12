import { SpyConsole } from '@huolala-tech/page-spy-types';
import { forwardRef, useCallback, useRef } from 'react';
import { AutoSizer } from 'react-virtualized';
import { VariableSizeList, ListProps, ListOnScrollProps } from 'react-window';
import { ConsoleItem } from './components/ConsoleItem';
interface Props {
  data: SpyConsole.DataItem[];
  onScroll: (props: ListOnScrollProps) => void;
}

export const ConsoleList = forwardRef<VariableSizeList, Props>(
  ({ data, onScroll }, ref) => {
    const innerRef = useRef<VariableSizeList>(null);
    const listRef = ref ?? innerRef;
    const heights = useRef<Map<number, number>>(new Map());

    const onHeightChange = (index: number, height: number) => {
      heights.current.set(index, height);
      Object(listRef).current?.resetAfterIndex(index, true);
    };

    const getItemSize = useCallback((index: number) => {
      return heights.current.get(index) ?? 27;
    }, []);

    const itemRenderer: ListProps<SpyConsole.DataItem[]>['children'] =
      useCallback(({ index, style, data }) => {
        const item = data[index];
        return (
          <div style={style} data-index={index} key={item.id}>
            <ConsoleItem
              data={item}
              onHeightChange={(height) => onHeightChange(index, height)}
            />
          </div>
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
    return (
      <AutoSizer>
        {({ width, height }) => (
          <VariableSizeList
            ref={listRef}
            width={width}
            height={height}
            itemSize={getItemSize}
            itemData={data}
            itemCount={data.length}
            onScroll={onScroll}
          >
            {itemRenderer}
          </VariableSizeList>
        )}
      </AutoSizer>
    );
  },
);
