/* eslint-disable no-case-declarations */
import { SpyNetwork, SpyStorage } from '@huolala-tech/page-spy-types';
import { Dropdown, Empty, Space, Tooltip } from 'antd';
import clsx from 'clsx';
import copy from 'copy-to-clipboard';
import { isString, throttle } from 'lodash-es';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { getContentType, getStatusInfo, getTime } from './utils';
import { useTranslation } from 'react-i18next';
import './index.less';
import { NetworkDetail } from './NetworkDetail';
import { ResolvedNetworkInfo } from '@/utils';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  Table,
  Column,
  AutoSizer,
  TableCellRenderer,
  SortDirectionType,
} from 'react-virtualized';
import 'react-virtualized/styles.css';

export type NetworkType =
  | 'All'
  | 'Fetch/XHR'
  | 'CSS'
  | 'JS'
  | 'Img'
  | 'Media'
  | 'Other';

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
              setLeftDistance(evt.target.clientWidth);
            }}
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
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
        {({ width, height }) => (
          <Table
            ref={tableRef}
            width={width}
            height={height}
            headerHeight={30}
            rowHeight={28}
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
              setSortBy(sortBy as keyof ResolvedNetworkInfo);
              setSortDirection(sortDirection);
            }}
            sortBy={sortBy}
            sortDirection={sortDirection}
          >
            <Column
              dataKey="name"
              label="Name"
              width={width * 0.3}
              // flexGrow={1}
              cellRenderer={NameColumn}
            />
            <Column
              dataKey="pathname"
              label="Path"
              width={width * 0.3}
              flexGrow={1}
            />
            <Column
              dataKey="method"
              label="Method"
              width={width * 0.1}
              maxWidth={150}
            />
            <Column
              dataKey="status"
              label="Status"
              width={width * 0.1}
              maxWidth={150}
              cellRenderer={StatusColumn}
            />
            <Column
              dataKey="requestType"
              label="Type"
              width={width * 0.1}
              maxWidth={150}
            />
            <Column
              dataKey="costTime"
              label="Time(≈)"
              width={width * 0.1}
              maxWidth={150}
              cellRenderer={({ cellData }) => {
                return getTime(cellData);
              }}
            />
          </Table>
        )}
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
