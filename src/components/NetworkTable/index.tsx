/* eslint-disable no-case-declarations */
import { SpyNetwork, SpyStorage } from '@huolala-tech/page-spy-types';
import { Dropdown, Empty } from 'antd';
import clsx from 'clsx';
import copy from 'copy-to-clipboard';
import { isString } from 'lodash-es';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { getStatusText, getTime } from './utils';
import { useTranslation } from 'react-i18next';
import './index.less';
import { NetworkDetail } from './NetworkDetail';
import { ResolvedNetworkInfo } from '@/utils';

const networkTitle = ['Name', 'Path', 'Method', 'Status', 'Type', 'Time(≈)'];

const getContentType = (headers: ResolvedNetworkInfo['requestHeader']) => {
  if (!headers) return 'text/plain';
  const contentType = headers.find(
    ([key]) => key.toLowerCase() === 'content-type',
  );
  return contentType?.[1] || 'text/plain';
};

interface NetworkTableProps {
  data: ResolvedNetworkInfo[];
  cookie?: SpyStorage.GetTypeDataItem['data'];
}

export const NetworkTable = ({ data, cookie }: NetworkTableProps) => {
  const { t: nt } = useTranslation('translation', { keyPrefix: 'network' });

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

  return (
    <div className="network-table">
      <div className="network-list">
        <table className="network-list__header">
          <thead>
            <tr>
              {networkTitle.map((t) => {
                return <td key={t}>{t}</td>;
              })}
            </tr>
          </thead>
        </table>
        {data.length > 0 ? (
          <table className="network-list__body">
            <tbody>
              {data.map((row, index) => {
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
              })}
            </tbody>
          </table>
        ) : (
          <Empty description={false} style={{ marginTop: 40 }} />
        )}
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
