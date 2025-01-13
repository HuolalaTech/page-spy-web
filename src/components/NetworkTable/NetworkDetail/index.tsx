import { EntriesBody } from '@/components/EntriesBody';
import { getObjectKeys, ResolvedNetworkInfo } from '@/utils';
import { Empty, Space } from 'antd';
import { ReactNode, memo, useEffect, useMemo, useState } from 'react';
import { PartOfHeader } from '../PartOfHeader';
import { StatusCode } from '../StatusCode';
import { validEntries } from '../utils';
import { QueryParamsBlock } from '../QueryParamsBlock';
import { RequestPayloadBlock } from '../RequestPayloadBlock';
import { ResponseBody } from '../ResponseBody';
import clsx from 'clsx';
import Icon from '@ant-design/icons';
import CloseSvg from '@/assets/image/close.svg?react';

interface Props {
  data: ResolvedNetworkInfo;
  onClose: () => void;
}

const generalFieldMap = {
  'Request URL': 'url',
  'Request Method': 'method',
} as const;

interface TabItem {
  title: string;
  visible: (data: ResolvedNetworkInfo) => boolean;
  content: (data: ResolvedNetworkInfo) => ReactNode;
}

const TABS: TabItem[] = [
  {
    title: 'Headers',
    visible: () => true,
    content: (data) => {
      const { requestHeader, responseHeader } = data;
      const headerContent = [
        {
          label: 'Request Header',
          data: validEntries(requestHeader) ? requestHeader : [],
        },
        {
          label: 'Response Header',
          data: validEntries(responseHeader) ? responseHeader : [],
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
                  <div className="entries-item" key={label}>
                    <b className="entries-item__label">{label}: &nbsp;</b>
                    <span className="entries-item__value">
                      <code>{data[field]}</code>
                    </span>
                  </div>
                );
              })}

              <div className="entries-item">
                <b className="entries-item__label">Status Code: &nbsp;</b>
                <span className="entries-item__value">
                  <code>
                    <StatusCode data={data} />
                  </code>
                </span>
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
                  {item.data?.length ? (
                    <EntriesBody data={item.data} />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={false}
                      style={{ margin: '10px 0' }}
                      imageStyle={{ height: 30 }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </>
      );
    },
  },
  {
    title: 'Payload',
    visible: (data) => {
      const { getData, requestPayload } = data;
      return !!requestPayload?.length || validEntries(getData);
    },
    content: (data) => {
      const { getData, requestPayload, requestHeader } = data;
      const isFormUrlencoded = requestHeader?.some(([name, value]) => {
        if (
          name.toLowerCase() === 'content-type' &&
          value.includes('application/x-www-form-urlencoded')
        )
          return true;
        return false;
      });

      return (
        <>
          {/* Request Payload */}
          {!!requestPayload?.length && (
            <RequestPayloadBlock
              data={requestPayload}
              urlencoded={isFormUrlencoded}
            />
          )}

          {/* Query String Parametes */}
          {validEntries(getData) && <QueryParamsBlock data={getData} />}
        </>
      );
    },
  },
  {
    title: 'EventStream',
    visible: (data) => {
      return data.requestType === 'eventsource';
    },
    content: (data) => {
      return <ResponseBody data={data} />;
    },
  },
  {
    title: 'Response',
    visible: (data) => {
      return data.requestType !== 'eventsource';
    },
    content: (data) => {
      return <ResponseBody data={data} />;
    },
  },
];

export const NetworkDetail = memo(({ data, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState('Headers');
  const activeContent = useMemo(() => {
    const tabItem = TABS.find((t) => t.title === activeTab);
    if (!tabItem) return <Empty />;
    return tabItem.content(data);
  }, [activeTab, data]);

  useEffect(() => {
    const ul = document.querySelector(
      '.network-detail-tabs',
    ) as HTMLUListElement;
    if (!ul) return;

    const li = document.querySelector(
      `[data-tab-id="${activeTab}"]`,
    ) as HTMLLIElement;
    if (!li) {
      setActiveTab('Headers');
      return;
    }

    const ulRect = ul.getBoundingClientRect();
    const liRect = li.getBoundingClientRect();
    ul.style.setProperty('--width', `${liRect.width}px`);
    ul.style.setProperty('--left', `${liRect.left - ulRect.left}px`);
  }, [data, activeTab]);

  return (
    <>
      <div className="network-detail-header">
        <div className="network-detail-close" onClick={onClose}>
          <Icon component={CloseSvg} style={{ fontSize: 20 }} />
        </div>
        <ul className="network-detail-tabs">
          {TABS.filter((t) => t.visible(data)).map((i) => {
            return (
              <li
                key={i.title}
                data-tab-id={i.title}
                className={clsx({
                  active: activeTab === i.title,
                })}
                onClick={() => {
                  setActiveTab(i.title);
                }}
              >
                {i.title}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="network-detail-content">{activeContent}</div>
    </>
  );
});
