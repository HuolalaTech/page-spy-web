import { EntriesBody } from '@/components/EntriesBody';
import { getObjectKeys } from '@/utils';
import { SpyNetwork } from '@huolala-tech/page-spy-types';
import { Empty, Space } from 'antd';
import { ReactNode, memo } from 'react';
import { PartOfHeader } from '../PartOfHeader';
import { StatusCode } from '../StatusCode';
import { validEntries } from '../utils';
import { QueryParamsBlock } from '../QueryParamsBlock';
import { RequestPayloadBlock } from '../RequestPayloadBlock';
import { ResponseBody } from '../ResponseBody';

interface Props {
  data: SpyNetwork.RequestInfo;
}

const generalFieldMap = {
  'Request URL': 'url',
  'Request Method': 'method',
} as const;

interface TabItem {
  title: string;
  visible: (data: SpyNetwork.RequestInfo) => boolean;
  content: (data: SpyNetwork.RequestInfo) => ReactNode;
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
                  {item.data ? (
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
      return !!requestPayload || validEntries(getData);
    },
    content: (data) => {
      const { getData, requestPayload } = data;
      return (
        <>
          {/* Request Payload */}
          {requestPayload && <RequestPayloadBlock data={requestPayload} />}

          {/* Query String Parametes */}
          {validEntries(getData) && <QueryParamsBlock data={getData} />}
        </>
      );
    },
  },
  {
    title: 'Response',
    visible: () => true,
    content: (data) => {
      return <ResponseBody data={data} />;
    },
  },
];

export const NetworkDetail = memo(({ data }: Props) => {
  return (
    <div className="detail-content">
      <ul className="detail-content-tabs">
        {TABS.filter((t) => t.visible(data)).map((i) => {
          return (
            <li data-tab-id={i.title} key={i.title}>
              {i.title}
            </li>
          );
        })}
      </ul>
    </div>
  );
});
