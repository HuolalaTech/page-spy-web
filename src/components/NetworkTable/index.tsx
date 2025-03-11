/* eslint-disable no-case-declarations */
import { SpyNetwork, SpyStorage } from '@huolala-tech/page-spy-types';
import { Dropdown, Empty, Space, Tooltip, Flex } from 'antd';
import clsx from 'clsx';
import copy from 'copy-to-clipboard';
import { isString, sortBy, throttle } from 'lodash-es';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { getContentType, getStatusInfo, getTime } from './utils';
import { useTranslation } from 'react-i18next';
import './index.less';
import { NetworkDetail } from './NetworkDetail';
import { ResolvedNetworkInfo } from '@/utils';
import {
  CaretDownOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
  CaretUpOutlined,
} from '@ant-design/icons';
import {
  Table,
  Column,
  AutoSizer,
  TableCellRenderer,
  SortDirectionType,
  TableHeaderRenderer,
} from 'react-virtualized';
import 'react-virtualized/styles.css';
import Draggable from 'react-draggable';

export type NetworkType =
  | 'All'
  | 'Fetch/XHR'
  | 'CSS'
  | 'JS'
  | 'Img'
  | 'Media'
  | 'Other';

const columnField = [
  'name',
  'pathname',
  'method',
  'status',
  'requestType',
  'costTime',
] as const;
type ColumnField = (typeof columnField)[number];

export const RESOURCE_TYPE: Map<
  NetworkType,
  (type: SpyNetwork.RequestType) => boolean
> = new Map([
  ['All', (type) => /.*/.test(type)],
  [
    'Fetch/XHR',
    (type) => /(fetch|xhr|mp-request|mp-upload|eventsource)/.test(type),
  ],
  ['CSS', (type) => /css/.test(type)],
  ['JS', (type) => /script/.test(type)],
  ['Img', (type) => /img/.test(type)],
  ['Media', (type) => /(audio|video)/.test(type)],
  [
    'Other',
    (type) =>
      !/(fetch|xhr|mp-request|mp-upload|eventsource|css|script|img|audio|video)/.test(
        type,
      ),
  ],
]);

interface NetworkTableProps {
  data: ResolvedNetworkInfo[];
  filterType: NetworkType;
  filterKeyword: string;
  cookie?: SpyStorage.GetTypeDataItem['data'];
  resizeCacheKey: string;
}

export const NetworkTable = ({
  data: originData,
  cookie,
  filterType = 'All',
  filterKeyword = '',
}: NetworkTableProps) => {
  const { t: nt } = useTranslation('translation', { keyPrefix: 'network' });

  const containerWidth = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeRow, setActiveRow] = useState<ResolvedNetworkInfo | null>(null);
  const [sortBy, setSortBy] = useState<keyof ResolvedNetworkInfo | undefined>(
    undefined,
  );
  const [sortDirection, setSortDirection] = useState<
    SortDirectionType | undefined
  >(undefined);
  const data = useMemo(() => {
    setActiveRow(null);
    const keyword = filterKeyword.trim().toLocaleLowerCase();
    if (!keyword && filterType === 'All' && !sortBy && !sortDirection) {
      return originData;
    }
    const filteredData = originData.filter(
      (msg) =>
        RESOURCE_TYPE.get(filterType)?.(msg.requestType) &&
        msg.url.toLocaleLowerCase().includes(keyword),
    );
    if (sortBy && sortDirection) {
      return filteredData.sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return sortDirection === 'ASC' ? -1 : 1;
        if (a[sortBy] > b[sortBy]) return sortDirection === 'ASC' ? 1 : -1;
        return 0;
      });
    }
    return filteredData;
  }, [filterKeyword, filterType, originData, sortBy, sortDirection]);

  const [leftDistance, setLeftDistance] = useState('20%');
  const hotKeyHandle = useCallback(
    (evt: KeyboardEvent) => {
      const { key } = evt;
      switch (key.toLocaleLowerCase()) {
        case 'escape':
          setShowDetail(false);
          break;
        case 'arrowup':
          if (activeRow) {
            const index = data.findIndex((item) => item.id === activeRow.id);
            if (index > 0) setActiveRow(data[index - 1]);
          }
          break;
        case 'arrowdown':
          if (activeRow) {
            const index = data.findIndex((item) => item.id === activeRow.id);
            if (index < data.length - 1) setActiveRow(data[index + 1]);
          }
          break;
        default:
          break;
      }
    },
    [activeRow, data],
  );
  useEffect(() => {
    document.addEventListener('keyup', hotKeyHandle);
    return () => {
      document.removeEventListener('keyup', hotKeyHandle);
    };
  }, [hotKeyHandle]);

  const onMenuClick = useCallback(
    (key: string, row: ResolvedNetworkInfo) => {
      switch (key) {
        case 'copy-link':
          copy(row.url);
          break;
        case 'open-in-new-tab':
          window.open(row.url);
          break;
        case 'copy-cURL':
          const {
            url,
            method,
            requestHeader,
            requestPayload,
            withCredentials,
          } = row;
          let result = `curl -X ${method} '${url}'`;
          let headers = '';
          if (requestHeader) {
            headers = requestHeader
              .map(([k, v]) => {
                return `  -H '${k}: ${v}'`;
              })
              .join(' \\\r\n');
          }
          if (withCredentials && cookie) {
            const cookieInfo = Object.entries(cookie)
              .map(([k, { value }]) => `${k}=${value}`)
              .join(';');
            headers = `${
              headers && `${headers} \\\r\n`
            }  -H 'cookie:${cookieInfo}'`;
          }
          if (headers) {
            result = `${result} \\\r\n${headers}`;
          }
          if (requestPayload) {
            const contentType = getContentType(requestHeader);
            let body = '';
            if (isString(requestPayload)) {
              body = `  --data-raw ${JSON.stringify(requestPayload)}`;
            } else {
              switch (contentType) {
                case 'multipart/form-data':
                  body = requestPayload
                    .map(([key, value]) => {
                      return `  --form ${JSON.stringify(`${key}=${value}`)}`;
                    })
                    .join(' \\\r\n');
                  break;
                case 'application/x-www-form-urlencoded;charset=UTF-8':
                  body = requestPayload
                    .map(([key, value]) => {
                      return `  --data-urlencode ${JSON.stringify(
                        `${key}=${value}`,
                      )}`;
                    })
                    .join(' \\\r\n');
                  break;
                default:
                  break;
              }
            }
            result = `${result} \\\r\n${body}`;
          }
          copy(result);
          break;
        default:
          throw Error('Unknown key');
      }
    },
    [cookie],
  );

  const tableRef = useRef<Table | null>(null);
  useEffect(() => {
    const observer = new ResizeObserver(
      throttle(() => {
        // @ts-ignore
        tableRef.current?.recomputeGridSize();
      }, 150),
    );
    observer.observe(containerRef.current!);
    return () => {
      observer.disconnect();
    };
  }, []);

  const [columnsWidth, setColumnsWidth] = useState<Record<ColumnField, number>>(
    {
      name: 0.3,
      pathname: 0.3,
      method: 0.1,
      status: 0.1,
      requestType: 0.1,
      costTime: 0.1,
    },
  );

  const handleColumnResize = (dataKey: ColumnField, deltaX: number) => {
    if (!containerWidth.current) return;

    setColumnsWidth((prev) => {
      const percentDelta = deltaX / containerWidth.current;
      const newWidth = prev[dataKey] + percentDelta;
      const nextDataKey = columnField[columnField.indexOf(dataKey) + 1];
      const nextWidth = prev[nextDataKey] - percentDelta;
      if (newWidth < 0.1 || nextWidth < 0.1) return prev;
      return {
        ...prev,
        [dataKey]: newWidth,
        [nextDataKey]: nextWidth,
      };
    });
  };

  const xOfDragger = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const headerRenderer = useCallback<TableHeaderRenderer>(
    ({ dataKey, label }) => (
      <>
        <Flex justify="space-between" align="center">
          <div className="ReactVirtualized__Table__headerTruncatedText">
            {label}
          </div>
          {sortBy === dataKey &&
            (sortDirection === 'ASC' ? (
              <CaretUpOutlined />
            ) : (
              <CaretDownOutlined />
            ))}
        </Flex>
        <Draggable
          axis="x"
          defaultClassName="DragHandle"
          defaultClassNameDragging="DragHandleActive"
          onStart={() => {
            xOfDragger.current = 0;
            setIsDragging(true);
          }}
          onStop={() => {
            setTimeout(() => {
              setIsDragging(false);
            }, 100);
          }}
          onDrag={(_, val) => {
            const deltaX = val.x - xOfDragger.current;
            xOfDragger.current = val.x;
            if (deltaX === 0) return;
            handleColumnResize(dataKey as ColumnField, deltaX);
          }}
          // @ts-ignore
          position={{ x: 0 }}
          zIndex={1000}
        >
          <div onClick={(e) => e.stopPropagation()} />
        </Draggable>
      </>
    ),
    [sortBy, sortDirection],
  );
  const NameColumn = useCallback<TableCellRenderer>(
    ({ rowData }) => {
      return (
        <Dropdown
          menu={{
            items: [
              {
                key: 'open-in-new-tab',
                label: nt('open-in-new-tab'),
              },
              {
                key: 'copy-link',
                label: nt('copy-link-address'),
              },
              { key: 'copy-cURL', label: nt('copy-as-curl') },
            ],
            onClick: ({ key }) => {
              onMenuClick(key, rowData);
            },
          }}
          trigger={['contextMenu']}
        >
          <div
            title={rowData.name}
            onClick={(evt: any) => {
              setShowDetail(true);
              setLeftDistance(evt.target.parentElement?.clientWidth);
            }}
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              height: '100%',
              lineHeight: '30px',
            }}
          >
            {rowData.name}
          </div>
        </Dropdown>
      );
    },
    [nt, onMenuClick],
  );
  const StatusColumn = useCallback<TableCellRenderer>(({ rowData }) => {
    const { status, text } = getStatusInfo(rowData);
    return status === 'unknown' ? (
      <Space>
        <span>{text}</span>
        <Tooltip
          title={
            <span>
              The status code is {rowData.status}, see{' '}
              <a
                style={{
                  color: 'white',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
                href="https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming/responseStatus"
                target="_blank"
              >
                MDN
              </a>
              .
            </span>
          }
        >
          <InfoCircleOutlined />
        </Tooltip>
      </Space>
    ) : (
      text
    );
  }, []);
  const NoData = useCallback(
    () => <Empty description={false} className="empty-table-placeholder" />,
    [],
  );
  return (
    <div className="network-table" ref={containerRef}>
      <AutoSizer>
        {({ width, height }) => {
          containerWidth.current = width;
          return (
            <Table
              ref={tableRef}
              width={width}
              height={height}
              headerHeight={30}
              rowHeight={30}
              rowCount={data.length}
              rowGetter={({ index }) => data[index]}
              noRowsRenderer={NoData}
              rowClassName={({ index }) => {
                if (index < 0) return '';
                return clsx(
                  index % 2 ? 'odd' : 'even',
                  getStatusInfo(data[index]).status,
                  {
                    active: data[index].id === activeRow?.id,
                  },
                );
              }}
              onRowClick={({ rowData }) => {
                setActiveRow(rowData);
              }}
              sort={({ sortBy, sortDirection }) => {
                if (isDragging) return;
                setSortBy(sortBy as keyof ResolvedNetworkInfo);
                setSortDirection(sortDirection);
              }}
              sortBy={sortBy}
              sortDirection={sortDirection}
            >
              <Column
                dataKey="name"
                label="Name"
                width={width * columnsWidth.name}
                headerRenderer={headerRenderer}
                cellRenderer={NameColumn}
                minWidth={100}
              />
              <Column
                dataKey="pathname"
                label="Path"
                width={width * columnsWidth.pathname}
                headerRenderer={headerRenderer}
                minWidth={100}
                flexGrow={1}
              />
              <Column
                dataKey="method"
                label="Method"
                width={width * columnsWidth.method}
                headerRenderer={headerRenderer}
                minWidth={80}
              />
              <Column
                dataKey="status"
                label="Status"
                width={width * columnsWidth.status}
                headerRenderer={headerRenderer}
                cellRenderer={StatusColumn}
                minWidth={80}
              />
              <Column
                dataKey="requestType"
                label="Type"
                width={width * columnsWidth.requestType}
                headerRenderer={headerRenderer}
                minWidth={80}
              />
              <Column
                dataKey="costTime"
                label="Time(≈)"
                width={width * columnsWidth.costTime}
                cellRenderer={({ cellData }) => getTime(cellData)}
                minWidth={80}
              />
            </Table>
          );
        }}
      </AutoSizer>
      {showDetail && activeRow && (
        <div
          className="network-detail"
          style={{
            left: leftDistance,
          }}
        >
          <NetworkDetail
            data={activeRow}
            onClose={() => {
              setShowDetail(false);
            }}
          />
        </div>
      )}
    </div>
  );
};
