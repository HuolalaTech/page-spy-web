/* eslint-disable no-case-declarations */
import { SpyStorage } from '@huolala-tech/page-spy-types';
import { Dropdown, Empty } from 'antd';
import clsx from 'clsx';
import copy from 'copy-to-clipboard';
import { isArray, isString } from 'lodash-es';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { getStatusText, getTime } from './utils';
import { useTranslation } from 'react-i18next';
import './index.less';
import { NetworkDetail } from './NetworkDetail';
import { ResolvedNetworkInfo } from '@/utils';
import {
  ResizableTitle,
  ResizableTitleProps,
  WIDTH_CONSTRAINTS,
} from '@/components/ResizableTitle';
import { ResizeCallbackData } from 'react-resizable';

const getContentType = (headers: ResolvedNetworkInfo['requestHeader']) => {
  if (!headers) return 'text/plain';
  const contentType = headers.find(
    ([key]) => key.toLowerCase() === 'content-type',
  );
  return contentType?.[1] || 'text/plain';
};

type Columns = Omit<
  ResizableTitleProps,
  'onResize' | 'onResizeStart' | 'onResizeStop'
>;

interface NetworkTableProps {
  data: ResolvedNetworkInfo[];
  cookie?: SpyStorage.GetTypeDataItem['data'];
  resizeCacheKey: string;
}

export const NetworkTable = ({
  data,
  cookie,
  resizeCacheKey,
}: NetworkTableProps) => {
  const { t: nt } = useTranslation('translation', { keyPrefix: 'network' });

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeIndex, setActiveIndex] = useState(-1);
  const [leftDistance, setLeftDistance] = useState('20%');
  const detailData = useMemo<ResolvedNetworkInfo | null>(() => {
    if (activeIndex < 0) {
      return null;
    }
    return data[activeIndex];
  }, [activeIndex, data]);
  const hotKeyHandle = useCallback(
    (evt: KeyboardEvent) => {
      const { key } = evt;
      switch (key.toLocaleLowerCase()) {
        case 'escape':
          setActiveIndex(-1);
          break;
        case 'arrowup':
          if (activeIndex > 0) setActiveIndex(activeIndex - 1);
          break;
        case 'arrowdown':
          if (activeIndex < data.length - 1) setActiveIndex(activeIndex + 1);
          break;
        default:
          break;
      }
    },
    [activeIndex, data.length],
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

  const [columns, setColumns] = useState<Columns[]>(() => {
    const cache = localStorage.getItem(resizeCacheKey);
    const value: Columns[] = cache && JSON.parse(cache);
    if (value && isArray(value)) {
      return value;
    }
    return [
      {
        children: 'Name',
        width: 150,
      },
      {
        children: 'Path',
        width: 300,
      },
      {
        children: 'Method',
        width: 100,
      },
      {
        children: 'Status',
        width: 100,
      },
      {
        children: 'Type',
        width: 100,
      },
      {
        children: 'Time(≈)',
      },
    ];
  });

  const mergedColumns = useMemo(() => {
    return columns.map((c, index) => ({
      ...c,
      onResizeStart: () => {
        const container = containerRef.current!;

        const lastColWidth = container.querySelector(
          'thead tr th:last-child',
        )?.clientWidth;
        if (!lastColWidth) return;

        const currentColWidth = container.querySelector(
          `thead tr th:nth-child(${index + 1})`,
        )?.clientWidth;
        if (!currentColWidth) return;

        const [min, max] = WIDTH_CONSTRAINTS;
        const diffValue = lastColWidth - min;
        const newCols = [...columns];

        let currentColMax = currentColWidth;
        if (diffValue > 0) {
          newCols[index].widthConstraints = [
            min,
            Math.min(max, currentColMax + diffValue),
          ];
        }
        setColumns(newCols);
      },
      onResize: ((
        _: React.SyntheticEvent<Element>,
        { size }: ResizeCallbackData,
      ) => {
        const newCols = [...columns];
        newCols[index] = {
          ...newCols[index],
          width: size.width,
        };
        if (index === 0) {
          setLeftDistance(`${size.width}px`);
        }
        setColumns(newCols);
      }) as React.ReactEventHandler<any>,
      onResizeStop: () => {
        const value = JSON.stringify(columns);
        localStorage.setItem(resizeCacheKey, value);
      },
    }));
  }, [columns, resizeCacheKey]);

  return (
    <div className="network-table" ref={containerRef}>
      <div className="network-list">
        <table>
          <thead>
            <tr>
              {mergedColumns.map((t) => {
                return <ResizableTitle key={t.children as string} {...t} />;
              })}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => {
                return (
                  <Dropdown
                    key={row.id}
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
                        onMenuClick(key, row);
                      },
                    }}
                    trigger={['contextMenu']}
                  >
                    <tr
                      className={clsx({
                        error:
                          row.readyState === 4 &&
                          (row.status === 0 || Number(row.status) >= 400),
                      })}
                    >
                      <td
                        title={row.name}
                        className={clsx({
                          active: !!detailData && index === activeIndex,
                        })}
                        onClick={(evt: any) => {
                          setActiveIndex(index);
                          setLeftDistance(evt.target.clientWidth);
                        }}
                      >
                        {row.name}
                      </td>
                      <td title={row.pathname}>{row.pathname}</td>
                      <td title={row.method}>{row.method}</td>
                      <td title={String(row.status)}>{getStatusText(row)}</td>
                      <td title={row.requestType}>{row.requestType}</td>
                      <td title={getTime(row.costTime)}>
                        {getTime(row.costTime)}
                      </td>
                    </tr>
                  </Dropdown>
                );
              })
            ) : (
              <Empty description={false} className="empty-table-placeholder" />
            )}
          </tbody>
        </table>
      </div>
      {detailData && (
        <div
          className="network-detail"
          style={{
            left: leftDistance,
          }}
        >
          <NetworkDetail
            data={detailData}
            onClose={() => {
              setActiveIndex(-1);
            }}
          />
        </div>
      )}
    </div>
  );
};
