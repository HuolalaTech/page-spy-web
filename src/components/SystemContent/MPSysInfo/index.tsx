import React, { useMemo } from 'react';
import './index.less';
import '../index.less';
import { Card, Typography, Grid, Row, Col, Empty, Space, Divider } from 'antd';
import {
  AppAuthSettings,
  AuthInfo,
  DeviceInfo,
  InfoItem,
  SysInfo,
} from './infoSchema';
import Icon, { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { ReactComponent as SupportSvg } from '@/assets/image/support.svg';
import { ReactComponent as UnsupportSvg } from '@/assets/image/unsupport.svg';
import { parseUserAgent } from '@/utils/brand';

type Props = {
  sysInfo: Record<string, any>;
  clientInfo: ReturnType<typeof parseUserAgent>;
  spanValue?: {
    featSpan: number;
    xxlFeatSpan: number;
  };
};
const { Title } = Typography;

const Schemas = [
  {
    title: '基础信息',
    schema: DeviceInfo,
  },
  {
    title: '应用授权',
    schema: AppAuthSettings,
  },
  {
    title: '手机系统信息',
    schema: SysInfo,
  },

  {
    title: '用户授权',
    schema: AuthInfo,
  },
];

const MPSysInfo = (props: Props) => {
  const { sysInfo, spanValue, clientInfo } = props;

  const renderValue = (item: InfoItem, v: any) => {
    if (item.render) {
      return item.render({ value: v });
    }
    if (typeof v === 'string') {
      return v;
    } else if (typeof v === 'object') {
      return JSON.stringify(v);
    } else if (typeof v === 'boolean') {
      const icon = v ? SupportSvg : UnsupportSvg;
      return (
        <Icon component={icon} style={{ fontSize: 16, fontWeight: 700 }} />
      );
    }
    return String(v);
  };

  return (
    <div className="system-content">
      <div className="system-info">
        <Title level={3}>主要信息</Title>
        <Card>
          <Row>
            <Col span={12}>
              <div className="mp-info-main">
                <img className="info-icon" src={clientInfo?.os.logo} />
                <Space
                  split={
                    <Divider style={{ marginInline: 0 }} type="vertical" />
                  }
                  size="small"
                >
                  {[
                    sysInfo?.brand,
                    sysInfo?.model,
                    clientInfo?.os.name + ' ' + clientInfo?.os.version,
                  ]
                    .filter((v) => v)
                    .map((v, i) => (
                      <span key={i}>{v}</span>
                    ))}
                </Space>
              </div>
            </Col>
            <Col span={12}>
              <div className="mp-info-main">
                <img className="info-icon" src={clientInfo?.browser.logo} />
                <span>
                  {clientInfo?.browser.name} {sysInfo['version']}
                </span>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
      {Schemas.map(({ title, schema }) => {
        const items = schema
          .map((item) => {
            const key = item.keys.find(
              (key) =>
                // TODO: how to distinguish the real 'undefined' string?
                sysInfo[key] !== undefined && sysInfo[key] !== 'undefined',
            );
            return { key, item };
          })
          .filter((item) => item.key);
        if (!items.length) {
          return (
            <div key={title} className="system-info">
              <Title level={3}>{title}</Title>
              <Card>
                <Empty description={false} />
              </Card>
            </div>
          );
        }
        return (
          <div key={title} className="system-info">
            <Title level={3}>{title}</Title>
            <Card>
              <Row>
                {items.map(({ key, item }) => {
                  return (
                    <Col
                      key={key}
                      span={spanValue?.featSpan}
                      xxl={{
                        span: spanValue?.xxlFeatSpan,
                      }}
                    >
                      <div className="mp-info-item" key={key}>
                        <div className="system-info__name">
                          <div className="system-info__label">{key}</div>
                          <div className="system-info__desc">{item.label}</div>
                        </div>
                        <div className="system-info__value">
                          {renderValue(item, sysInfo[key!])}
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default MPSysInfo;
