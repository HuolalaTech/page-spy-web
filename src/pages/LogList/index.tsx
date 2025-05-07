import { deleteSpyLog, getSpyLogs } from '@/apis';
import { useRequest } from 'ahooks';
import {
  Typography,
  Row,
  Col,
  message,
  Button,
  Input,
  Form,
  Space,
  Table,
  Tooltip,
  TagProps,
  DatePicker,
  Popconfirm,
  Divider,
  Layout,
} from 'antd';
import { Trans, useTranslation } from 'react-i18next';
import './index.less';
import { Link } from 'react-router-dom';
import { ExtraLogButton } from './ExtraLogButton';
import dayjs, { type Dayjs } from 'dayjs';
import request from '@/apis/request';
import { ComponentType, useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircleOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MinusCircleOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { isCN } from '@/assets/locales';
import prettyBytes from 'pretty-bytes';
import { parseUserAgent } from '@/utils/brand';
import { getObjectKeys } from '@/utils';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Sider, Content } = Layout;

const FILE_STATUS: Record<
  I.SpyLog['status'],
  {
    icon: ComponentType;
    color: TagProps['color'];
  }
> = {
  Unknown: {
    icon: MinusCircleOutlined,
    color: 'default',
  },
  Created: {
    icon: ClockCircleOutlined,
    color: 'default',
  },
  Error: {
    icon: CloseCircleOutlined,
    color: 'error',
  },
  Saved: {
    icon: CheckCircleOutlined,
    color: 'success',
  },
};

const LogList = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const currentPage = useRef({ page: 1, size: 10 });
  const {
    loading,
    data: logList = { data: [], total: 0, page: 1, size: 10 },
    runAsync: requestClientLogs,
  } = useRequest(
    async () => {
      const { date, project, title, deviceId } = form.getFieldsValue();
      const [start, end]: Dayjs[] = date || [];
      const params = {
        project,
        title,
        deviceId,
        from: start?.startOf('date').unix(),
        to: end?.endOf('date').unix(),
        ...currentPage.current,
      };
      getObjectKeys(params).forEach((k) => {
        if (!params[k] || params[k].toString().trim() === '') {
          delete params[k];
        }
      });
      const res = await getSpyLogs(params);
      // 从 tag 里提取客户端信息
      res.data.data?.forEach((d) => {
        d?.tags.forEach(({ key, value }) => {
          if (key === 'userAgent') {
            d.client = parseUserAgent(value);
          } else {
            d[key] = value;
          }
        });
      });
      return res.data;
    },
    {
      onError(e) {
        message.error(e.message);
      },
    },
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { run: requestDeleteLog } = useRequest(
    (fileId: string[]) => deleteSpyLog(fileId),
    {
      manual: true,
      onSuccess() {
        requestClientLogs();
      },
      onError(e) {
        message.error(e.message);
      },
    },
  );
  const footerContent = useCallback(() => {
    if (selectedRowKeys.length) {
      return (
        <Popconfirm
          title={t('replay.delete-title')}
          description={t('replay.delete-select-desc')}
          onConfirm={() => requestDeleteLog(selectedRowKeys as string[])}
          okText={t('common.confirm')}
          cancelText={t('common.cancel')}
        >
          <Button ghost danger size="small">
            {t('replay.delete-select')}
          </Button>
        </Popconfirm>
      );
    }
    return null;
  }, [requestDeleteLog, selectedRowKeys, t]);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);
      if (isMobileView) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // 为移动端定义简化的表格列配置
  const getMobileColumns = () => [
    // 客户端信息和基本信息
    {
      title: () => t('replay.client'),
      key: 'client',
      render: (_: any, row: I.SpyLog) => {
        const { client, deviceId } = row;
        const { icon, color } =
          FILE_STATUS[row.status as keyof typeof FILE_STATUS] || FILE_STATUS['Unknown'];
          
        return (
          <Space size="small" direction="vertical" style={{ width: '100%' }}>
            {/* 设备ID和客户端信息 */}
            <div className="mobile-icons-container">
              <Tooltip title={`${t('devtool.system')}: ${client?.os.name} ${client?.os.version}`}>
                <img className="client-info__logo mobile-icon" src={client?.os.logo} />
              </Tooltip>
              <div className="page-spy-id mobile-id">
                <b>{deviceId?.slice(0, 4)}</b>
              </div>
              <Tooltip title={`${t('devtool.browser')}: ${client?.browser.name} ${client?.browser.version}`}>
                <img className="client-info__logo mobile-icon" src={client?.browser.logo} />
              </Tooltip>
            </div>
            
            {/* 项目和标题 */}
            <div className="mobile-item">
              <span className="mobile-label">{t('common.project')}:</span>
              <span className="mobile-value">{row.project}</span>
            </div>
            <div className="mobile-item">
              <span className="mobile-label">{t('common.title')}:</span>
              <span className="mobile-value">{row.title}</span>
            </div>
            
            {/* 备注 */}
            <div className="mobile-item">
              <span className="mobile-label">{t('replay.remark')}:</span>
              <span className="mobile-value">{row.remark || '--'}</span>
            </div>
            
            {/* 创建时间 */}
            <div className="mobile-item">
              <span className="mobile-label">{t('common.createdAt')}:</span>
              <span className="mobile-value">{dayjs(row.createdAt).format('YYYY-MM-DD HH:mm')}</span>
            </div>
            
            {/* 文件信息 */}
            <div className="mobile-item">
              <span className="mobile-label">{t('replay.file-info')}:</span>
              <div className="mobile-value-container">
                <span className="mobile-value mobile-filename">{row.name}</span>
                <Tooltip
                  placement="topLeft"
                  title={
                    <div>
                      <div>
                        <b>{t('replay.file-status')}：</b>
                        {row.status}
                      </div>
                      <div>
                        <b>{t('replay.file-size')}：</b>
                        <span>{prettyBytes(row.size)}</span>
                      </div>
                    </div>
                  }
                >
                  <InfoCircleOutlined className="info-icon" />
                </Tooltip>
              </div>
            </div>
          </Space>
        );
      },
    },
    // 操作按钮
    {
      title: () => t('common.actions'),
      key: 'actions',
      width: 110,
      render: (_: any, row: I.SpyLog) => {
        const logUrl = `${request.defaultPrefix}/log/download?fileId=${row.fileId}`;
        return (
          <div className="mobile-actions-container">
            <Space size="small" direction="vertical">
              <Link
                to={{
                  pathname: '/replay',
                  search: `?fileId=${row.fileId}`,
                }}
                target="_blank"
              >
                <Button
                  className="action-item"
                  type="link"
                  size="small"
                  icon={<PlayCircleOutlined />}
                >
                  {t('replay.debug')}
                </Button>
              </Link>
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => {
                  // 使用认证令牌构建下载链接
                  const token = localStorage.getItem(
                    'page-spy-auth-token',
                  );
                  if (!token) {
                    message.error(t('auth.login_required'));
                    return;
                  }

                  // 创建一个临时的a元素来处理下载（带Authorization头）
                  const xhr = new XMLHttpRequest();
                  xhr.open('GET', logUrl, true);
                  xhr.setRequestHeader(
                    'Authorization',
                    `Bearer ${token}`,
                  );
                  xhr.responseType = 'blob';

                  xhr.onload = function () {
                    if (xhr.status === 200) {
                      const blob = xhr.response;
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      // 从服务器响应中获取文件名或使用默认文件名
                      const contentDisposition = xhr.getResponseHeader(
                        'Content-Disposition',
                      );
                      let filename = 'log-file.json';
                      if (contentDisposition) {
                        const filenameMatch =
                          contentDisposition.match(/filename=(.+)/);
                        if (filenameMatch && filenameMatch[1]) {
                          filename = filenameMatch[1];
                        }
                      }
                      a.download = filename;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    } else {
                      message.error(t('common.download_failed'));
                    }
                  };

                  xhr.onerror = function () {
                    message.error(t('common.download_failed'));
                  };

                  xhr.send();
                }}
              >
                {t('replay.download-file')}
              </Button>
              <Popconfirm
                title={t('replay.delete-title')}
                description={t('replay.delete-desc')}
                onConfirm={() => requestDeleteLog([row.fileId])}
                okText={t('common.confirm')}
                cancelText={t('common.cancel')}
              >
                <Button
                  danger
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                >
                  {t('common.delete')}
                </Button>
              </Popconfirm>
            </Space>
          </div>
        );
      },
    },
  ];

  // 获取桌面端表格列配置
  const getDesktopColumns = () => [
            // 客户端信息
            {
              title: () => t('replay.client'),
              key: 'client',
              width: 220,
      render: (_: any, row: I.SpyLog) => {
                const { client, deviceId } = row;
                return (
                  <Space size="small">
                    <Tooltip
                      title={
                        <>
                          <span>
                            {t('devtool.system')}: {client?.os.name}
                          </span>
                          <br />
                          <span>
                            {t('devtool.version')}: {client?.os.version}
                          </span>
                        </>
                      }
                    >
                      <img
                        className="client-info__logo"
                        src={client?.os.logo}
                      />
                    </Tooltip>
                    <Divider type="vertical" />
                    <Tooltip
                      title={
                        <>
                          <span>
                            {t('devtool.browser')}: {client?.browser.name}
                          </span>
                          <br />
                          <span>
                            {t('devtool.version')}: {client?.browser.version}
                          </span>
                        </>
                      }
                    >
                      <img
                        className="client-info__logo"
                        src={client?.browser.logo}
                      />
                    </Tooltip>
                    <Divider type="vertical" />
                    <Tooltip title="Device ID">
                      <div className="page-spy-id">
                        <b>{deviceId?.slice(0, 4)}</b>
                      </div>
                    </Tooltip>
                  </Space>
                );
              },
            },
            // Project
            {
              title: () => t('common.project'),
              width: 150,
              dataIndex: 'project',
              ellipsis: {
                showTitle: false,
              },
      render: (project: string) => (
                <Tooltip placement="topLeft" title={project}>
                  {project}
                </Tooltip>
              ),
            },
            // Title
            {
              title: () => t('common.title'),
              width: 150,
              dataIndex: 'title',
              ellipsis: {
                showTitle: false,
              },
      render: (title: string) => (
                <Tooltip placement="topLeft" title={title}>
                  {title}
                </Tooltip>
              ),
            },
            // Remark
            {
              title: () => t('replay.remark'),
              width: 150,
              dataIndex: 'remark',
              ellipsis: {
                showTitle: false,
              },
      render: (remark: string) => (
                <Tooltip placement="left" title={remark}>
                  {remark || '--'}
                </Tooltip>
              ),
            },
            // 文件信息
            {
              title: () => t('replay.file-info'),
              key: 'file-info',
              width: 200,
      render: (_: any, row: I.SpyLog) => {
                const { icon, color } =
          FILE_STATUS[row.status as keyof typeof FILE_STATUS] || FILE_STATUS['Unknown'];
                return (
                  <Space>
                    <Tooltip placement="topLeft" title={row.name}>
                      <p style={{ maxWidth: 150 }} className="text-ellipse">
                        {row.name}
                      </p>
                    </Tooltip>
                    <Tooltip
                      placement="topLeft"
                      title={
                        <div>
                          <div>
                            <b>{t('replay.file-status')}：</b>
                            {row.status}
                          </div>
                          <div>
                            <b>{t('replay.file-size')}：</b>
                            <span>{prettyBytes(row.size)}</span>
                          </div>
                        </div>
                      }
                    >
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                );
              },
            },
            // 创建时间
            {
              title: () => t('common.createdAt'),
              width: 180,
              dataIndex: 'createdAt',
              ellipsis: {
                showTitle: false,
              },
      render: (value: string) => {
                const title = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
                return <Tooltip title={title}>{title}</Tooltip>;
              },
            },
            // 操作
            {
              title: () => t('common.actions'),
              width: 300,
      fixed: 'right' as const,
              key: 'actions',
      render: (_: any, row: I.SpyLog) => {
                const logUrl = `${request.defaultPrefix}/log/download?fileId=${row.fileId}`;
                return (
                  <Space size="small">
                    <Link
                      to={{
                        pathname: '/replay',
                        search: `?fileId=${row.fileId}`,
                      }}
                      target="_blank"
                    >
                      <Button
                        className="action-item"
                        type="link"
                        size="small"
                        icon={<PlayCircleOutlined />}
                      >
                        {t('replay.debug')}
                      </Button>
                    </Link>
                    <Button
                      type="text"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => {
                        // 使用认证令牌构建下载链接
                        const token = localStorage.getItem(
                          'page-spy-auth-token',
                        );
                        if (!token) {
                          message.error(t('auth.login_required'));
                          return;
                        }

                        // 创建一个临时的a元素来处理下载（带Authorization头）
                        const xhr = new XMLHttpRequest();
                        xhr.open('GET', logUrl, true);
                        xhr.setRequestHeader(
                          'Authorization',
                          `Bearer ${token}`,
                        );
                        xhr.responseType = 'blob';

                        xhr.onload = function () {
                          if (xhr.status === 200) {
                            const blob = xhr.response;
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.style.display = 'none';
                            a.href = url;
                            // 从服务器响应中获取文件名或使用默认文件名
                            const contentDisposition = xhr.getResponseHeader(
                              'Content-Disposition',
                            );
                            let filename = 'log-file.json';
                            if (contentDisposition) {
                              const filenameMatch =
                                contentDisposition.match(/filename=(.+)/);
                              if (filenameMatch && filenameMatch[1]) {
                                filename = filenameMatch[1];
                              }
                            }
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          } else {
                            message.error(t('common.download_failed'));
                          }
                        };

                        xhr.onerror = function () {
                          message.error(t('common.download_failed'));
                        };

                        xhr.send();
                      }}
                    >
                      {t('replay.download-file')}
                    </Button>
                    <Popconfirm
                      title={t('replay.delete-title')}
                      description={t('replay.delete-desc')}
                      onConfirm={() => requestDeleteLog([row.fileId])}
                      okText={t('common.confirm')}
                      cancelText={t('common.cancel')}
                    >
                      <Button
                        danger
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                      >
                        {t('common.delete')}
                      </Button>
                    </Popconfirm>
                  </Space>
                );
              },
            },
  ];

  return (
    <Layout style={{ height: '100%' }} className="log-list">
      <Sider
        theme="light"
        width={350}
        collapsed={collapsed}
        collapsedWidth={0}
        trigger={null}
        collapsible
      >
        <div className="log-list-sider">
          <Title level={3} style={{ marginBottom: 32 }}>
            <Space>
              {t('replay.list-title')}
              <Tooltip
                title={
                  <Trans i18nKey="replay.intro">
                    <span>{`What's `}</span>
                    <a
                      href={
                        isCN()
                          ? import.meta.env.VITE_WIKI_REPLAY_LOG_ZH
                          : import.meta.env.VITE_WIKI_REPLAY_LOG
                      }
                      target="_blank"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      {t('replay.title')}
                    </a>
                  </Trans>
                }
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          </Title>
          <Form
            layout="vertical"
            form={form}
            onFinish={() => {
              currentPage.current.page = 1;
              requestClientLogs();
            }}
          >
            <Form.Item label={t('replay.date')} name="date">
              <RangePicker
                picker="date"
                style={{ width: '100%' }}
                format="YYYY/MM/DD"
              />
            </Form.Item>
            <Form.Item label={t('common.device-id')} name="deviceId">
              <Input placeholder={t('common.device-id')!} allowClear />
            </Form.Item>
            <Form.Item label={t('common.project')} name="project">
              <Input placeholder={t('common.project')!} allowClear />
            </Form.Item>
            <Form.Item label={t('common.title')} name="title">
              <Input placeholder={t('common.title')!} allowClear />
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
                    <ExtraLogButton />
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Sider>
      <div
        className="sider-trigger"
        onClick={() => setCollapsed(!collapsed)}
        style={{
          backgroundColor: collapsed ? 'transparent' : '#fff',
          left: collapsed ? 0 : 350,
        }}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>
      <Content
        style={{
          padding: isMobile ? 10 : 24,
          marginLeft: isMobile ? 0 : collapsed ? 0 : '18px',
          display: isMobile && !collapsed ? 'none' : 'block',
        }}
      >
        <Table
          bordered
          loading={loading}
          scroll={{
            x: isMobile ? undefined : undefined,
            y: isMobile ? 'calc(100vh - 150px)' : '65vh',
          }}
          rowKey="fileId"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => {
              setSelectedRowKeys(keys);
            },
          }}
          pagination={{
            total: logList.total,
            current: currentPage.current.page,
            pageSize: currentPage.current.size,
            size: isMobile ? 'small' : 'default',
            showSizeChanger: !isMobile,
            simple: isMobile,
          }}
          onChange={({ current, pageSize }) => {
            currentPage.current = {
              page: current || 1,
              size: pageSize || 10,
            };
            setSelectedRowKeys([]);
            requestClientLogs();
          }}
          dataSource={logList.data}
          columns={isMobile ? getMobileColumns() : getDesktopColumns()}
          footer={selectedRowKeys.length ? footerContent : undefined}
          size={isMobile ? 'small' : 'middle'}
        />
      </Content>
    </Layout>
  );
};

export default LogList;
