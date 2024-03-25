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
  Tag,
  TagProps,
  DatePicker,
  Popconfirm,
} from 'antd';
import { Trans, useTranslation } from 'react-i18next';
import './index.less';
import { Link } from 'react-router-dom';
import { SelectLogButton } from './SelectLogButton';
import dayjs from 'dayjs';
import request from '@/apis/request';
import { ComponentType, useMemo, useRef } from 'react';
import Icon, {
  CheckCircleOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { isCN } from '@/assets/locales';
import prettyBytes from 'pretty-bytes';

const { Title } = Typography;
const { RangePicker } = DatePicker;

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

export const LogList = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const tableScrollY = useMemo(() => {
    if (window.innerWidth <= 1500) {
      return '42vh';
    }
    return '53vh';
  }, []);

  const currentPage = useRef(1);
  const {
    loading,
    data: logList = { data: [], total: 0, page: 1, size: 10 },
    runAsync: requestClientLogs,
  } = useRequest(
    async () => {
      const params = {
        ...form.getFieldsValue(),
        date: form
          .getFieldValue('date')
          ?.map((d: string) => dayjs(d).format('YYYY/MM/DD')),
        page: currentPage.current,
      };
      const res = await getSpyLogs(params);
      return res.data;
    },
    {
      onError(e) {
        message.error(e.message);
      },
    },
  );

  const deletingFileId = useRef('');
  const { run: requestDeleteLog, loading: deleting } = useRequest(
    (fileId: string) => deleteSpyLog({ fileId }),
    {
      manual: true,
      onSuccess() {
        requestClientLogs();
      },
    },
  );

  return (
    <div className="log-list">
      <div className="log-list-content">
        <Title level={3} style={{ marginBottom: 12 }}>
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
          form={form}
          onFinish={() => {
            currentPage.current = 1;
            requestClientLogs();
          }}
          labelCol={{
            span: 6,
          }}
        >
          <Row gutter={24} wrap>
            <Col span={8}>
              <Form.Item label={t('replay.date')} name="date">
                <RangePicker
                  picker="date"
                  style={{ width: '100%' }}
                  format="YYYY/MM/DD"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t('common.project')} name="project">
                <Input placeholder={t('common.project')!} allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t('common.title')} name="title">
                <Input placeholder={t('common.title')!} allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t('common.device-id')} name="roomId">
                <Input placeholder={t('common.device-id')!} allowClear />
              </Form.Item>
            </Col>
          </Row>
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
                  <SelectLogButton />
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Table
          bordered
          loading={loading}
          scroll={{
            y: tableScrollY,
          }}
          pagination={{
            total: logList.total,
            current: currentPage.current,
          }}
          onChange={({ current }) => {
            currentPage.current = current || 1;
            requestClientLogs();
          }}
          dataSource={logList.data}
          columns={[
            {
              title: () => t('replay.filename'),
              dataIndex: 'name',
              ellipsis: {
                showTitle: false,
              },
              render: (filename) => (
                <Tooltip placement="topLeft" title={filename}>
                  {filename}
                </Tooltip>
              ),
            },
            {
              title: () => t('replay.file-status'),
              dataIndex: 'status',
              render: (value: I.SpyLog['status']) => {
                const { icon, color } =
                  FILE_STATUS[value] || FILE_STATUS['Unknown'];
                return (
                  <Tag icon={<Icon component={icon} />} color={color}>
                    {value}
                  </Tag>
                );
              },
            },
            {
              title: () => t('replay.file-size'),
              dataIndex: 'size',
              render: (value: number) => {
                return <span>{prettyBytes(value)}</span>;
              },
            },
            {
              title: () => t('common.createdAt'),
              dataIndex: 'createdAt',
              render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
            },
            {
              title: () => t('common.actions'),
              key: 'actions',
              render: (_, row) => {
                const logUrl = `${request.defaultPrefix}/log/download?fileId=${row.fileId}`;
                return (
                  <Space size="middle">
                    <Link
                      className="action-item"
                      to={{ pathname: '/replay', search: `?url=${logUrl}` }}
                      target="_blank"
                    >
                      <Space>
                        <PlayCircleOutlined />
                        <span>{t('replay.debug')}</span>
                      </Space>
                    </Link>
                    <Popconfirm
                      title={t('replay.delete-title')}
                      description={t('replay.delete-desc')}
                      onConfirm={() => requestDeleteLog(row.fileId)}
                      okText={t('common.confirm')}
                      cancelText={t('common.cancel')}
                    >
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        loading={
                          row.fileId === deletingFileId.current && deleting
                        }
                      >
                        {t('common.delete')}
                      </Button>
                    </Popconfirm>
                  </Space>
                );
              },
            },
          ]}
        />
      </div>
    </div>
  );
};
