import { useSocketMessageStore } from '@/store/socket-message';
import { SpyStorage } from '@huolala-tech/page-spy';
import {
  Button,
  Col,
  Divider,
  Form,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
} from 'antd';
import { useMemo, useCallback, useState } from 'react';
import { useCacheDetailStore } from '@/store/cache-detail';
import { capitalize } from 'lodash';
import { ReactComponent as DatabaseSvg } from '@/assets/image/database.svg';
import { ReactComponent as StorageSvg } from '@/assets/image/storage.svg';
import Icon, {
  CaretLeftOutlined,
  CaretRightOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import ReactJsonView from '@huolala-tech/react-json-view';
import { useTranslation } from 'react-i18next';
import './index.less';
import { useEventListener } from '@/utils/useEventListener';
import { CUSTOM_EVENT } from '@/store/socket-message/socket';

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
  const { t: ct } = useTranslation('translation', { keyPrefix: 'common' });
  const { t } = useTranslation('translation', { keyPrefix: 'storage' });
  const [form] = Form.useForm();
  const [socket, { basicInfo, data: dbMsg }] = useSocketMessageStore(
    (state) => [state.socket, state.databaseMsg],
  );
  const [isStale, setIsStale] = useState(false);
  const onGetIndexedDB = useCallback(
    (values: any) => {
      if (isStale) {
        setIsStale(false);
      }
      if (!socket) return;
      socket.unicastMessage({
        type: 'database-pagination',
        data: {
          db: values.database,
          store: values.store,
          page: 1,
        },
      });
    },
    [isStale, socket],
  );
  const onSkip = useCallback(
    (action: 'prev' | 'next') => {
      if (isStale) {
        setIsStale(false);
      }
      if (!socket || !dbMsg) return;
      socket.unicastMessage({
        type: 'database-pagination',
        data: {
          db: dbMsg.database?.name,
          store: dbMsg.store?.name,
          page: dbMsg.page[action],
        },
      });
    },
    [dbMsg, isStale, socket],
  );

  useEventListener(CUSTOM_EVENT.DatabaseStoreUpdated, (evt: Event) => {
    const { database, store } = (evt as CustomEvent).detail;
    const values = form.getFieldsValue();
    if (values.database === database && values.store === store) {
      setIsStale(true);
    }
  });

  const tableData = useMemo(() => {
    if (!dbMsg) return [];
    const { page, data } = dbMsg;
    const result = data.map((val: any, idx: number) => {
      const index = 50 * (page.current - 1) + idx;
      const item: any = {
        index,
        keyPath: val.key,
        value: val.value,
      };
      return item;
    });
    return result;
  }, [dbMsg]);

  return (
    <div className="database-info">
      <Row
        justify="space-between"
        align="middle"
        style={{
          padding: 12,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Col>
          <Form form={form} layout="inline" onFinish={onGetIndexedDB}>
            <Form.Item label="Database" name="database">
              <Select
                placeholder="Select database"
                style={{ width: 240 }}
                onChange={() => {
                  form.setFieldValue('store', undefined);
                }}
              >
                {basicInfo?.map((i) => {
                  return (
                    <Option key={i.name} value={i.name}>
                      <div title={i.name}>
                        <Space>
                          <Icon component={DatabaseSvg} />
                          <span style={{ fontSize: 14 }}>{i.name}</span>
                        </Space>
                        <br />
                        <Space style={{ fontSize: 12, color: '#999' }} size={2}>
                          <span>Version: {i.version || 1}</span>
                          <Divider type="vertical" />
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
                const stores =
                  basicInfo?.find((i) => i.name === db)?.stores || [];
                return (
                  <Form.Item noStyle name="store">
                    <Select placeholder="Select store" style={{ width: 240 }}>
                      {stores.map((i) => {
                        return (
                          <Option key={i.name} value={i.name}>
                            <Row justify="space-between" align="middle">
                              <Col>
                                <Space title={i.name}>
                                  <Icon component={StorageSvg} />
                                  <span style={{ fontSize: 14 }}>{i.name}</span>
                                </Space>
                              </Col>
                              <Col>
                                <Tooltip
                                  placement="right"
                                  title={
                                    <>
                                      <Space>
                                        Key path:
                                        <ReactJsonView
                                          darkMode
                                          source={i.keyPath}
                                          copyable={false}
                                          expandable={false}
                                        />
                                      </Space>
                                      <br />
                                      <Space>
                                        Auto increment:
                                        <ReactJsonView
                                          darkMode
                                          source={i.autoIncrement as any}
                                          copyable={false}
                                          expandable={false}
                                        />
                                      </Space>
                                      <br />
                                      <Space>
                                        Indexes:
                                        <ReactJsonView
                                          darkMode
                                          source={i.indexes}
                                          copyable={false}
                                          expandable={false}
                                        />
                                      </Space>
                                    </>
                                  }
                                >
                                  <InfoCircleOutlined />
                                </Tooltip>
                              </Col>
                            </Row>
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                );
              }}
            </Form.Item>
            <Form.Item shouldUpdate>
              {({ getFieldsValue }) => {
                const { database, store } = getFieldsValue();
                return (
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={!database || !store}
                  >
                    {ct('submit')}
                  </Button>
                );
              }}
            </Form.Item>
          </Form>
        </Col>
        <Col>
          <Space>
            {isStale && (
              <Space size={4}>
                <Tooltip title={t('entries-be-modified')}>
                  <WarningOutlined style={{ color: '#DC933E', fontSize: 18 }} />
                </Tooltip>
                <span>{t('data-be-stale')}</span>
              </Space>
            )}
            <Button disabled={!dbMsg?.page.prev} onClick={() => onSkip('prev')}>
              <CaretLeftOutlined />
            </Button>
            <Button disabled={!dbMsg?.page.next} onClick={() => onSkip('next')}>
              <CaretRightOutlined />
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        className="database-table"
        rowKey="index"
        bordered
        dataSource={tableData}
        pagination={false}
        tableLayout="fixed"
        size="small"
      >
        <Column title="#" dataIndex="index" width={80} />
        <Column
          title={
            <Space size={2}>
              Key{' '}
              {dbMsg?.store?.keyPath && (
                <Space size={0}>
                  <span>(Key path: </span>
                  <ReactJsonView
                    source={dbMsg.store.keyPath}
                    copyable={false}
                    expandable={false}
                  />
                  <span>)</span>
                </Space>
              )}
            </Space>
          }
          render={(value) => <ReactJsonView source={value} maxTitleSize={20} />}
          dataIndex="keyPath"
        />
        <Column
          title="Value"
          dataIndex="value"
          render={(value) => <ReactJsonView source={value} maxTitleSize={50} />}
        />
      </Table>
    </div>
  );
};
