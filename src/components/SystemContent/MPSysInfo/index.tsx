import React from 'react';
import './index.less';
import '../index.less';
import { Card, Typography, Grid, Row, Col } from 'antd';
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
import { useSocketMessageStore } from '@/store/socket-message';
type Props = {
  sysInfo: Record<string, any>;
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
    title: '手机系统信息',
    schema: SysInfo,
  },
  {
    title: '应用授权',
    schema: AppAuthSettings,
  },
  {
    title: '用户授权',
    schema: AuthInfo,
  },
];

const MPSysInfo = (props: Props) => {
  const { sysInfo, spanValue } = props;
  const clientInfo = useSocketMessageStore((socket) => socket.clientInfo);

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
            <Col span={8}>
              <div className="mp-info-main">
                <img className="info-icon" src={clientInfo?.os.logo} />
                <span>
                  {sysInfo?.brand} {sysInfo?.model} {clientInfo?.os.name}{' '}
                  {clientInfo?.os.version}
                </span>
              </div>
            </Col>
            <Col span={16}>
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
        return (
          <div key={title} className="system-info">
            <Title level={3}>{title}</Title>
            <Card>
              <Row>
                {schema.map((item, index) => {
                  const key = item.keys.find((key) =>
                    Object.hasOwn(sysInfo, key),
                  );
                  if (key) {
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
                            <div className="system-info__desc">
                              {item.label}
                            </div>
                          </div>
                          <div className="system-info__value">
                            {renderValue(item, sysInfo[key])}
                          </div>
                        </div>
                      </Col>
                    );
                  }
                  return <></>;
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
