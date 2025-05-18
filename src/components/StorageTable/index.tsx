import { useCacheDetailStore } from '@/store/cache-detail';
import { StorageType } from '@/store/platform-config';
import { SpyStorage } from '@huolala-tech/page-spy-types';
import { Table, TableColumnsType, Tooltip } from 'antd';
import { capitalize } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ResizableTitle } from '../ResizableTitle';
import { ResizeCallbackData } from 'react-resizable';
import { ColumnType } from 'antd/es/table/interface';

const allCols: TableColumnsType<SpyStorage.Data> = [
  {
    dataIndex: 'name',
    title: 'Name',
    ellipsis: true,
    width: 200,
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    dataIndex: 'value',
    title: 'Value',
    ellipsis: true,
    width: 300,
    sorter: (a, b) => a.value.localeCompare(b.value),
  },
  {
    dataIndex: 'domain',
    title: 'Domain',
    ellipsis: true,
    width: 200,
    sorter: (a, b) => {
      if (!(a.domain && b.domain)) return 0;
      return a.domain.localeCompare(b.domain);
    },
  },
  {
    dataIndex: 'path',
    title: 'Path',
    ellipsis: true,
    width: 100,
    sorter: (a, b) => {
      if (!(a.path && b.path)) return 0;
      return a.path.localeCompare(b.path);
    },
  },
  {
    dataIndex: 'expires',
    title: 'Expires',
    ellipsis: true,
    width: 240,
    render: (value: string) => {
      const time = value ? new Date(value).toISOString() : 'Session';
      return (
        <Tooltip placement="topLeft" title={time}>
          {time}
        </Tooltip>
      );
    },
    sorter: (a, b) => {
      if (!(a.expires && b.expires)) return 0;
      return a.expires.toString().localeCompare(b.expires.toString());
    },
  },
  {
    dataIndex: 'secure',
    title: 'Secure',
    ellipsis: true,
    width: 80,
    render: (bool: boolean) => bool && '✅',
    sorter: (a, b) => {
      if (!(a.secure && b.secure)) return 0;
      return a.secure.toString().localeCompare(b.secure.toString());
    },
  },
  {
    dataIndex: 'sameSite',
    title: 'SameSite',
    ellipsis: true,
    width: 80,
    render: (v: string) => capitalize(v),
    sorter: (a, b) => {
      if (!(a.sameSite && b.sameSite)) return 0;
      return a.sameSite.toString().localeCompare(b.sameSite.toString());
    },
  },
  {
    dataIndex: 'partitioned',
    title: 'Partitioned',
    ellipsis: true,
    sorter: (a, b) => {
      if (!(a.partitioned && b.partitioned)) return 0;
      return a.partitioned.toString().localeCompare(b.partitioned.toString());
    },
  },
];

interface Props {
  activeTab: StorageType;
  storageMsg: Record<StorageType, SpyStorage.GetTypeDataItem['data']>;
  resizeCacheKey: string;
}

export const StorageTable = ({
  activeTab,
  storageMsg,
  resizeCacheKey,
}: Props) => {
  // 添加移动端检测
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const data = useMemo(() => {
    return Object.values(storageMsg[activeTab]);
  }, [activeTab, storageMsg]);
  const hasDetail = useMemo(() => {
    const { name, value, ...rest } = data[0] || {};
    return Object.keys(rest).length > 0;
  }, [data]);

  const unionCacheKey = useMemo(
    () => `${resizeCacheKey}:${activeTab}${isMobile ? ':mobile' : ''}`,
    [resizeCacheKey, activeTab, isMobile],
  );
  const cacheWidthRef = useRef<Record<string, { [title: string]: number }>>({});

  const [columns, setColumns] =
    useState<ColumnType<SpyStorage.Data>[]>(allCols);

  // Init width from cache
  useMemo(() => {
    const cache = localStorage.getItem(unionCacheKey);
    const value = cache && JSON.parse(cache);
    if (value) {
      cacheWidthRef.current[unionCacheKey] = value;
      const widthInitedColumns = [...allCols].map((i) => {
        return {
          ...i,
          width: value[i.title] || i.width,
        };
      });
      setColumns(widthInitedColumns);
    } else {
      cacheWidthRef.current[unionCacheKey] = {};
    }
  }, [unionCacheKey]);

  // Dragging
  const mergedColumns = useMemo(() => {
    let renderCols = [...columns];
    if (!hasDetail && renderCols.length !== 2) {
      renderCols = renderCols.slice(0, 2);
    }
    
    // 移动端适配，仅显示Name和Value两列
    if (isMobile && renderCols.length > 2) {
      renderCols = renderCols.slice(0, 2);
      // 调整移动端下的列宽
      renderCols[0].width = 120; // Name列宽
      renderCols[1].width = window.innerWidth - 140; // Value列宽
    }
    
    const cacheWidth = cacheWidthRef.current[unionCacheKey];
    if (cacheWidth) {
      renderCols.forEach((i) => {
        // 确保title是字符串
        const title = typeof i.title === 'string' ? i.title : '';
        const width = title ? cacheWidth[title] : undefined;
        if (width) {
          i.width = width;
        }
      });
    }

    return renderCols.map((c, index) => ({
      ...c,
      onHeaderCell: (column: ColumnType<SpyStorage.Data>) => ({
        width: column.width,
        onResize: ((
          _: React.SyntheticEvent<Element>,
          data: ResizeCallbackData,
        ) => {
          const { size } = data;

          const newCols = [...renderCols];
          newCols[index] = {
            ...newCols[index],
            width: size.width,
          };
          setColumns(newCols);

          // 确保title是字符串
          const title = typeof column.title === 'string' ? column.title : '';
          cacheWidthRef.current[unionCacheKey][title] = size.width;
        }) as React.ReactEventHandler<any>,
        onResizeStop: (_: React.SyntheticEvent, data: ResizeCallbackData) => {
          const refValue = cacheWidthRef.current[unionCacheKey];

          localStorage.setItem(unionCacheKey, JSON.stringify(refValue));
        },
      }),
    }));
  }, [columns, hasDetail, unionCacheKey, isMobile]);

  const setDetailInfo = useCacheDetailStore((state) => state.setCurrentDetail);

  return (
    <Table
      className={`storage-table ${isMobile ? 'storage-table--mobile' : ''}`}
      rowKey="name"
      bordered={false}
      dataSource={data}
      pagination={false}
      size={isMobile ? "small" : "small"}
      columns={mergedColumns}
      onRow={(record) => {
        return {
          onClick() {
            setDetailInfo(record.value || '');
          },
        };
      }}
      components={{
        header: {
          cell: ResizableTitle,
        },
      }}
    />
  );
};
