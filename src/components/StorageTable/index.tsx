import { useCacheDetailStore } from '@/store/cache-detail';
import { StorageType } from '@/store/platform-config';
import { SpyStorage } from '@huolala-tech/page-spy-types';
import { Table, Tooltip } from 'antd';
import { capitalize } from 'lodash-es';
import { useMemo } from 'react';

const { Column } = Table;

interface Props {
  activeTab: StorageType;
  storageMsg: Record<StorageType, SpyStorage.GetTypeDataItem['data']>;
}

export const StorageTable = ({ activeTab, storageMsg }: Props) => {
  const data = useMemo(() => {
    return Object.values(storageMsg[activeTab]);
  }, [activeTab, storageMsg]);
  const hasDetail = useMemo(() => {
    const { name, value, ...rest } = data[0] || {};
    return Object.keys(rest).length > 0;
  }, [data]);

  const setDetailInfo = useCacheDetailStore((state) => state.setCurrentDetail);

  return (
    <Table
      rowKey="name"
      bordered={false}
      dataSource={data}
      pagination={false}
      tableLayout="fixed"
      size="small"
      onRow={(record) => {
        return {
          onClick() {
            setDetailInfo(record.value || '');
          },
        };
      }}
    >
      <Column title="Name" dataIndex="name" key="name" ellipsis />
      <Column title="Value" dataIndex="value" ellipsis />
      {hasDetail && (
        <>
          <Column title="Domain" dataIndex="domain" ellipsis />
          <Column title="Path" width={120} dataIndex="path" ellipsis />
          <Column
            title="Expires"
            dataIndex="expires"
            ellipsis
            render={(value) => {
              const time = value ? new Date(value).toISOString() : 'Session';
              return (
                <Tooltip placement="topLeft" title={time}>
                  {time}
                </Tooltip>
              );
            }}
          />
          <Column
            align="center"
            title="Secure"
            dataIndex="secure"
            width={80}
            render={(bool) => bool && '✅'}
          />
          <Column
            title="SameSite"
            dataIndex="sameSite"
            width={80}
            render={(v) => capitalize(v)}
          />
          <Column title="Partitioned" width={120} dataIndex="partitioned" />
        </>
      )}
    </Table>
  );
};
