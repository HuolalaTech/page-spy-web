import { getSpyRoom } from '@/apis';
import {
  AllBrowserTypes,
  AllMPTypes,
  OS_CONFIG,
  getBrowserLogo,
  getBrowserName,
  parseUserAgent,
} from '@/utils/brand';
import { useRequest } from 'ahooks';
import {
  Typography,
  Row,
  Col,
  message,
  Empty,
  Button,
  Input,
  Form,
  Select,
  Space,
  Layout,
} from 'antd';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';
import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import { ParsedRoom, useRoomListStore } from '@/store/room-list';
import { useShallow } from 'zustand/react/shallow';
import { LoadingFallback } from '@/components/LoadingFallback';
import { VirtualList } from './VirtualList';

const { Title } = Typography;
const { Option } = Select;
const { Sider, Content } = Layout;

// 按搜索条件过滤房间
const filterConnections = (
  data: ParsedRoom[],
  condition: Record<'title' | 'address' | 'os' | 'browser', string>,
) => {
  const { title = '', address = '', os = '', browser = '' } = condition;
  const lowerCaseTitle = String(title).trim().toLowerCase();
  return data
    .filter(({ tags }) => {
      return String(tags.title).toLowerCase().includes(lowerCaseTitle);
    })
    .filter((i) => i.address.slice(0, 4).includes(address || ''))
    .filter(({ os: itemOs, browser: itemBrowser }) => {
      return (
        (!os || itemOs.type === os) &&
        (!browser || itemBrowser.type.includes(browser))
      );
    });
};

export const RoomList = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const [conditions, setConditions] = useState({
    title: '',
    address: '',
    os: '',
    browser: '',
  });
  const [originList, rowRooms, setOriginList, computeRowRooms] =
    useRoomListStore(
      useShallow((state) => [
        state.originList,
        state.rowRooms,
        state.setOriginList,
        state.computeRowRooms,
      ]),
    );

  const loadingUsed = useRef(false);
  const {
    error,
    loading,
    runAsync: requestConnections,
  } = useRequest(
    async (group = '') => {
      const res = await getSpyRoom(group);
      return (res.data || []).map((conn) => {
        const { os, browser, framework } = parseUserAgent(conn.name);
        return {
          ...conn,
          os,
          browser,
          framework,
        };
      });
    },
    {
      pollingInterval: 10 * 1000,
      pollingWhenHidden: false,
      pollingErrorRetryCount: 0,
      onSuccess(data) {
        setOriginList(filterConnections(data, conditions));
        computeRowRooms();
      },
      onError(e) {
        message.error(e.message);
      },
      onFinally() {
        loadingUsed.current = true;
      },
    },
  );

  const BrowserOptions = useMemo(() => {
    return AllBrowserTypes.filter((browser) => {
      return originList?.some(
        (conn) => conn.browser.type.toLocaleLowerCase() === browser,
      );
    }).map((name) => {
      return {
        name,
        label: getBrowserName(name),
        logo: getBrowserLogo(name),
      };
    });
  }, [originList]);

  const MPTypeOptions = useMemo(() => {
    return AllMPTypes.filter((mp) => {
      return originList?.some((conn) => conn.browser.type === mp);
    }).map((name) => {
      return {
        name,
        label: getBrowserName(name),
        logo: getBrowserLogo(name),
      };
    });
  }, [originList]);

  const onFormFinish = useCallback(
    async (value: any) => {
      setConditions((state) => ({
        ...state,
        ...value,
      }));
      await requestConnections(value.project);
    },
    [requestConnections],
  );

  const mainContent = useMemo(() => {
    if (loading && loadingUsed.current === false) {
      return <LoadingFallback />;
    }

    if (error || rowRooms.length === 0)
      return (
        <Empty
          style={{
            marginTop: 60,
          }}
        />
      );

    return <VirtualList />;
  }, [error, loading, rowRooms.length]);

  return (
    <Layout style={{ height: '100%' }} className="room-list">
      <Sider width={350} theme="light" style={{ padding: 24 }}>
        <Title level={3} style={{ marginBottom: 32 }}>
          {t('common.connections')}
        </Title>
        <Form layout="vertical" form={form} onFinish={onFormFinish}>
          <Form.Item label={t('common.device-id')} name="address">
            <Input placeholder={t('common.device-id')!} allowClear />
          </Form.Item>
          <Form.Item label={t('common.project')} name="project">
            <Input placeholder={t('common.project')!} allowClear />
          </Form.Item>
          <Form.Item label={t('common.title')} name="title">
            <Input placeholder={t('common.title')!} allowClear />
          </Form.Item>
          <Form.Item label={t('common.os')} name="os">
            <Select placeholder={t('connections.select-os')} allowClear>
              {Object.entries(OS_CONFIG).map(([name, conf]) => {
                return (
                  <Option value={name} key={name}>
                    <div className="flex-between">
                      <span>{conf.label}</span>
                      <img src={conf.logo} height="20" alt="" />
                    </div>
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item label={t('common.browser')} name="browser">
            <Select
              listHeight={500}
              placeholder={t('connections.select-browser')}
              allowClear
            >
              {!!BrowserOptions.length && (
                <Select.OptGroup label="Web" key="web">
                  {BrowserOptions.map(({ name, logo, label }) => {
                    return (
                      <Option key={name} value={name}>
                        <div className="flex-between">
                          <span>{label}</span>
                          <img src={logo} width="20" height="20" alt="" />
                        </div>
                      </Option>
                    );
                  })}
                </Select.OptGroup>
              )}

              {!!MPTypeOptions.length && (
                <Select.OptGroup
                  label={t('common.miniprogram')}
                  key="miniprogram"
                >
                  {MPTypeOptions.map(({ name, logo, label }) => {
                    return (
                      <Option key={name} value={name}>
                        <div className="flex-between">
                          <span>{label}</span>
                          <img src={logo} width="20" height="20" alt="" />
                        </div>
                      </Option>
                    );
                  })}
                </Select.OptGroup>
              )}
            </Select>
          </Form.Item>
          <Row justify="end">
            <Col>
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                  >
                    {t('common.search')}
                  </Button>
                  <Button
                    type="default"
                    icon={<ClearOutlined />}
                    onClick={() => {
                      form.resetFields();
                      form.submit();
                    }}
                  >
                    {t('common.reset')}
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Sider>
      <Content>{mainContent}</Content>
    </Layout>
  );
};
