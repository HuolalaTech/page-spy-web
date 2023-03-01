/* eslint-disable no-case-declarations */
import { getObjectKeys } from '@/utils';
import { Button, Col, Dropdown, Empty, Menu, Row, Space, Tooltip } from 'antd';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ClearOutlined } from '@ant-design/icons';
import clsx from 'classnames';
import { useWSInfo } from '../WSInfo';
import './index.less';
import { TypeNode } from '../TypeNode';
import {
  getStatusText,
  getTime,
  PartOfHeader,
  QueryParamsBlock,
  ResponseBody,
  StatusCode,
  validValues,
} from './comps';
import type { SpyNetwork } from '@huolala-tech/page-spy';
import copy from 'copy-to-clipboard';

const networkTitle = ['Name', 'Path', 'Method', 'Status', 'Type', 'Time(≈)'];
const generalFieldMap = {
  'Request URL': 'url',
  'Request Method': 'method',
} as const;

const NetworkPanel = () => {
  const { networkMsg: data, storageMsg, clearRecord } = useWSInfo();
  const detailClicked = useRef<boolean>(false);
  const [showDetail, setShowDetail] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [leftDistance, setLeftDistance] = useState('20%');
  const detailData = useMemo<SpyNetwork.RequestInfo | null>(() => {
    if (activeIndex < 0) {
      return null;
    }
    return data[activeIndex];
  }, [activeIndex, data]);
  useEffect(() => {
    const listener = (evt: MouseEvent) => {
      const dom = evt.target! as HTMLElement;
      if (detailClicked.current) {
        detailClicked.current = false;
        return;
      }
      if (dom.tagName === 'TD' && dom.dataset.clickout) {
        setShowDetail(true);
      } else {
        setShowDetail(false);
      }
    };

    document.addEventListener('click', listener);
    return () => {
      document.removeEventListener('click', listener);
    };
  }, []);
  const hotKeyHandle = useCallback(
    (evt: KeyboardEvent) => {
      const { key } = evt;
      switch (key.toLocaleLowerCase()) {
        case 'escape':
          setShowDetail(false);
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
    (key: string, row: SpyNetwork.RequestInfo) => {
      switch (key) {
        case 'copy-link':
          copy(row.url);
          break;
        case 'open-in-new-tab':
          window.open(row.url);
          break;
        case 'copy-cURL':
          let result = `curl '${row.url}'`;
          let headers = '';
          if (row.requestHeader) {
            headers = Object.entries(row.requestHeader)
              .map(([k, v]) => {
                return `-H '${k}: ${v}'`;
              })
              .join(' \\\r\n');
          }
          if (row.withCredentials) {
            const cookie = Object.entries(storageMsg.cookie)
              .map(([k, v]) => `${k}=${v}`)
              .join('; ');
            headers = `${headers && `${headers} \\\r\n`}-H 'cookie: ${cookie}'`;
          }
          if (headers) {
            result = `${result} \\\r\n${headers}`;
          }
          copy(result);
          break;
        default:
          throw Error('Unknown key');
      }
    },
    [storageMsg.cookie],
  );

  const DetailBlock = useMemo(() => {
    if (detailData) {
      const emptyContent = (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={false}
          style={{ margin: '10px 0' }}
          imageStyle={{ height: 30 }}
        />
      );
      const { getData, postData, requestHeader, responseHeader } = detailData;
      const headerContent = [
        {
          label: 'Request Header',
          data: validValues(requestHeader),
        },
        {
          label: 'Response Header',
          data: validValues(responseHeader),
        },
      ];
      return (
        <>
          {/* General */}
          <div className="detail-block">
            <div className="detail-block__label">General Info</div>
            <div className="detail-block__content">
              {getObjectKeys(generalFieldMap).map((label) => {
                const field = generalFieldMap[label];
                return (
                  <div className="content-item" key={label}>
                    <div className="content-item__label">{label}: &nbsp;</div>
                    <div className="content-item__value">
                      <code>{detailData[field]}</code>
                    </div>
                  </div>
                );
              })}

              <div className="content-item">
                <div className="content-item__label">Status Code: &nbsp;</div>
                <div className="content-item__value">
                  <code>
                    <StatusCode data={detailData} />
                  </code>
                </div>
              </div>
            </div>
          </div>
          {/* Header Content */}
          {headerContent.map((item) => {
            return (
              <div className="detail-block" key={item.label}>
                <Space className="detail-block__label">
                  <span>{item.label}</span>
                  <PartOfHeader />
                </Space>
                <div className="detail-block__content">
                  {item.data
                    ? Object.keys(item.data).map((label) => {
                        return (
                          <div className="content-item" key={label}>
                            <div className="content-item__label">
                              {label}: &nbsp;
                            </div>
                            <div className="content-item__value">
                              <code>{item.data[label]}</code>
                            </div>
                          </div>
                        );
                      })
                    : emptyContent}
                </div>
              </div>
            );
          })}
          {/* Query String Parametes */}
          {validValues(getData) && <QueryParamsBlock data={getData} />}

          {/* Request Payload */}
          {validValues(postData) && (
            <div className="detail-block">
              <div className="detail-block__label">Request Payload</div>
              <div className="detail-block__content pre-wrap">
                <TypeNode source={JSON.stringify(postData)} spread />
              </div>
            </div>
          )}

          {/* Response Body */}
          <div className="detail-block">
            <div className="detail-block__label">Response</div>
            <div className="detail-block__content pre-wrap">
              <ResponseBody data={detailData} />
            </div>
          </div>
        </>
      );
    }
    return <Empty />;
  }, [detailData]);
  return (
    <div className="network-panel">
      <Row justify="end">
        <Col>
          <Tooltip title="Clear">
            <Button onClick={() => clearRecord('network')}>
              <ClearOutlined />
            </Button>
          </Tooltip>
        </Col>
      </Row>
      <div className="network-panel__content">
        <div className="network-wrapper">
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
                              label: 'Open in new tab',
                            },
                            { key: 'copy-link', label: 'Copy link address' },
                            { key: 'copy-cURL', label: 'Copy as cURL' },
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
                              (row.status === 0 || row.status >= 400),
                          })}
                        >
                          <td
                            data-clickout
                            title={row.name}
                            className={clsx({
                              active: showDetail && index === activeIndex,
                            })}
                            onClick={(evt: any) => {
                              setActiveIndex(index);
                              // setDetailData(row);
                              setLeftDistance(evt.target.clientWidth);
                            }}
                          >
                            {row.name}
                          </td>
                          <td title={row.url}>{row.url}</td>
                          <td title={row.method}>{row.method}</td>
                          <td title={String(row.status)}>
                            {getStatusText(row)}
                          </td>
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
          {showDetail && (
            <div
              className="network-detail"
              style={{
                left: leftDistance,
              }}
              onClick={() => {
                detailClicked.current = true;
              }}
            >
              {DetailBlock}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkPanel;
