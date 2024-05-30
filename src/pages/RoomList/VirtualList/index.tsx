import { useRoomListStore } from '@/store/room-list';
import { useThrottleFn, useMount } from 'ahooks';
import { Skeleton, Row, Col } from 'antd';
import { forwardRef, memo, useEffect, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  ReactElementType,
  FixedSizeList,
  ListChildComponentProps,
  areEqual,
} from 'react-window';
import { useShallow } from 'zustand/react/shallow';
import { RoomCard } from '../RoomCard';
import { useEventListener } from '@/utils/useEventListener';

// 外层容器
const ContentContainer = forwardRef<HTMLDivElement, any>(
  ({ style, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...style,
          height: `${parseFloat(style.height) + 24 * 2}px`,
        }}
        {...rest}
      />
    );
  },
) as ReactElementType;

// 每一行的房间
const RowRooms = memo(
  ({ index, style, data }: ListChildComponentProps<I.SpyRoom[][]>) => {
    const [columnCount] = useRoomListStore(
      useShallow((state) => [state.columnCount]),
    );
    const [isLoading, setIsLoading] = useState(true);
    useMount(() => {
      setIsLoading(false);
    });

    return (
      <div
        style={{ ...style, top: Number(style.top) + 24, paddingInline: 24 }}
        data-row={index}
      >
        {isLoading ? (
          <Skeleton active />
        ) : (
          <Row gutter={24}>
            {data[index].map((room) => {
              return (
                <Col span={24 / columnCount} key={room.address}>
                  <RoomCard key={room.address} room={room} />
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    );
  },
  areEqual,
);

export const VirtualList = memo(() => {
  const [rowCount, columnCount, setColumnCount, rowRooms, computeRowRooms] =
    useRoomListStore(
      useShallow((state) => [
        state.rowCount,
        state.columnCount,
        state.setColumnCount,
        state.rowRooms,
        state.computeRowRooms,
      ]),
    );
  const updateLayout = useThrottleFn(
    () => {
      const { innerWidth } = window;
      let span = 6;
      if (innerWidth < 700) {
        span = 1;
      } else if (innerWidth < 800) {
        span = 2;
      } else if (innerWidth < 1200) {
        span = 3;
      } else if (innerWidth < 1600) {
        span = 4;
      }
      if (columnCount === span) return;
      setColumnCount(span);
      computeRowRooms();
    },
    { wait: 500 },
  );
  useEffect(() => {
    updateLayout.run();
    return updateLayout.cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEventListener('resize', updateLayout.run);

  return (
    <AutoSizer>
      {({ width, height }) => {
        return (
          <FixedSizeList
            width={width}
            height={height}
            innerElementType={ContentContainer}
            useIsScrolling
            itemCount={rowCount}
            itemData={rowRooms}
            itemSize={230}
          >
            {RowRooms as any}
          </FixedSizeList>
        );
      }}
    </AutoSizer>
  );
});
