import { useSocketMessageStore } from '@/store/socket-message';
import { SpyDatabase, SpyStorage } from '@huolala-tech/page-spy';
import { Col, Empty, Form, Row, Select, Space, Table, Tooltip } from 'antd';
import { useState, useMemo, useCallback } from 'react';
import { useCacheDetailStore } from '../store';
import { capitalize } from 'lodash';
import { ReactComponent as DatabaseSvg } from '@/assets/image/database.svg';
import { ReactComponent as StorageSvg } from '@/assets/image/storage.svg';
import Icon from '@ant-design/icons';
import ReactJsonView from '@huolala-tech/react-json-view';

const { Column } = Table;
const { Option } = Select;

interface Props {
  activeTab: SpyStorage.DataType;
}

export const StorageInfo = ({ activeTab }: Props) => {
  const storageMsg = useSocketMessageStore((state) => state.storageMsg);
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

export const DatabaseInfo = () => {
  const [form] = Form.useForm();
  const dbMsg = useSocketMessageStore((state) => state.databaseMsg);

  const [storeInfo, setStoreInfo] = useState<SpyDatabase.DBStoreInfo | null>(
    null,
  );
  const onFormChange = useCallback(
    (changed: any) => {
      if (changed.database) {
        form.setFieldValue('store', undefined);
      }
      const { database, store } = form.getFieldsValue();
      if (!database || !store) {
        setStoreInfo(null);
      } else {
        const result = dbMsg
          ?.find((i) => i.database === database)
          ?.stores.find((i) => i.name === store);
        if (!result) {
          setStoreInfo(null);
        } else {
          setStoreInfo(result);
        }
      }
    },
    [dbMsg, form],
  );

  if (!dbMsg?.length) {
    return <Empty />;
  }

  return (
    <div className="database-info">
      <Form
        form={form}
        layout="inline"
        onValuesChange={onFormChange}
        style={{ padding: 12, position: 'sticky', top: 0, zIndex: 100 }}
      >
        <Form.Item label="Database" name="database">
          <Select placeholder="Select database" style={{ width: 240 }}>
            {dbMsg.map((i) => {
              return (
                <Option key={i.database} value={i.database}>
                  <div title={i.database}>
                    <Space>
                      <Icon component={DatabaseSvg} />
                      <span style={{ fontSize: 14 }}>{i.database}</span>
                    </Space>
                    <br />
                    <Space style={{ fontSize: 12, color: '#999' }}>
                      <span>Version: {i.version || 1}</span>
                      <span>Object stores: {i.stores.length}</span>
                    </Space>
                  </div>
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          label="Store"
          shouldUpdate={(prev, next) => prev.database !== next.database}
        >
          {({ getFieldValue }) => {
            const db = getFieldValue('database');
            const stores = dbMsg.find((i) => i.database === db)?.stores || [];
            return (
              <Form.Item noStyle name="store">
                <Select placeholder="Select store" style={{ width: 240 }}>
                  {stores.map((i) => {
                    return (
                      <Option key={i.name} value={i.name}>
                        <Space title={i.name}>
                          <Icon component={StorageSvg} />
                          <span style={{ fontSize: 14 }}>{i.name}</span>
                        </Space>
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            );
          }}
        </Form.Item>
      </Form>

      <Table
        rowKey="name"
        bordered={false}
        dataSource={storeInfo?.data || []}
        pagination={false}
        tableLayout="fixed"
        size="small"
      >
        <Column title="#" render={(_, $, index) => index} width={80} />
        <Column
          title={
            <Space size={2}>
              Key{' '}
              {storeInfo?.keyPath && (
                <Space size={0}>
                  <span>(Key path: </span>
                  <ReactJsonView
                    source={storeInfo.keyPath}
                    copyable={false}
                    expandable={false}
                  />
                  <span>)</span>
                </Space>
              )}
            </Space>
          }
          // render={() => <ReactJsonView />}
          dataIndex="name"
          key="name"
          ellipsis
        />
        <Column title="Value" dataIndex="value" ellipsis />
      </Table>
    </div>
  );
};
