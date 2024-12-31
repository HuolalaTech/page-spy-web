import { memo, useMemo } from 'react';
import { Card, Col, Empty, Row, Typography } from 'antd';
import './index.less';
import { FeatureItem } from '@/components/FeatureItem';
import { useTranslation } from 'react-i18next';
import { useSocketMessageStore } from '@/store/socket-message';
import { parseUserAgent } from '@/utils/brand';
import { SpySystem } from '@huolala-tech/page-spy-types';
import { useReplayStore } from '@/store/replay';
import { flattenRecord } from '@/utils/tools';
import MPSysInfo from './MPSysInfo';

const { Title } = Typography;

interface SystemContentProps {
  data: SpySystem.DataItem[];
}

const SystemContent = memo(({ data }: SystemContentProps) => {
  const { t } = useTranslation('translation', { keyPrefix: 'system' });
  const { features, system, mp } = data[0] || {};
  const clientInfo = useMemo(() => {
    return parseUserAgent(system?.ua);
  }, [system]);

  const mpSysInfo = useMemo(() => {
    if (mp) {
      try {
        const sysInfo = JSON.parse(mp);
        return sysInfo;
      } catch (e) {
        console.error(e);
        // if parse error, the client is still mp, should display the mp panel.
        return {};
      }
    }
    return null;
  }, [mp]);

  const noSupport = useMemo(() => {
    if (!features) return [];
    return Object.values(features).reduce((acc, cur) => {
      cur.forEach((item) => {
        if (!item.supported) {
          acc.push(item);
        }
      });
      return acc;
    }, []);
  }, [features]);

  const isExpand = useReplayStore((state) => state.isExpand);
  const spanValue = useMemo(() => {
    if (isExpand) {
      return {
        overviewSpan: 10,
        featSpan: 24,
        xxlFeatSpan: 12,
      };
    }
    return {
      overviewSpan: 4,
      featSpan: 8,
      xxlFeatSpan: 6,
    };
  }, [isExpand]);

  if (data.length === 0) {
    return <Empty description={false} />;
  }
  if (mpSysInfo) {
    return (
      <MPSysInfo
        sysInfo={mpSysInfo}
        clientInfo={clientInfo}
        spanValue={spanValue}
      />
    );
  }
  return (
    <div className="system-content">
      <div className="system-info">
        <Title level={3}>{t('overview')}</Title>
        <Card>
          <Row>
            <Col span={spanValue.overviewSpan} className="system-info__label">
              System:
            </Col>
            <Col className="system-info__value">{`${clientInfo?.os.name}/${clientInfo?.os.version}`}</Col>
          </Row>
          <Row>
            <Col span={spanValue.overviewSpan} className="system-info__label">
              Platform:
            </Col>
            <Col className="system-info__value">{`${clientInfo?.browser.name}/${clientInfo?.browser.version}`}</Col>
          </Row>
          <Row wrap={false}>
            <Col span={spanValue.overviewSpan} className="system-info__label">
              User Agent:
            </Col>
            <Col className="system-info__value">{system.ua}</Col>
          </Row>
        </Card>
      </div>

      {Object.keys(features).length > 0 && (
        <>
          <div className="system-info">
            <Title level={3}>{t('feature')}</Title>
            {noSupport.length && (
              <>
                <Title level={5} style={{ color: 'rgb(216, 30, 6)' }}>
                  <span>{t('unsupport')}</span>
                </Title>
                <Card
                  style={{
                    borderColor: 'rgb(216, 30, 6)',
                    backgroundColor: 'rgba(216, 30, 6, 0.1)',
                  }}
                >
                  <Row>
                    {noSupport.map((feature) => (
                      <Col
                        span={spanValue.featSpan}
                        xxl={{
                          span: spanValue.xxlFeatSpan,
                        }}
                        key={feature.title}
                      >
                        <FeatureItem {...feature} />
                      </Col>
                    ))}
                  </Row>
                </Card>
              </>
            )}
          </div>
          {Object.entries(features).map(([key, value]) => {
            return (
              <div className="system-info" key={key}>
                <Title level={5}>{key}</Title>
                <Card>
                  <Row>
                    {value.map((feature) => (
                      <Col
                        span={spanValue.featSpan}
                        xxl={{ span: spanValue.xxlFeatSpan }}
                        key={feature.title}
                      >
                        <FeatureItem {...feature} />
                      </Col>
                    ))}
                  </Row>
                </Card>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
});

export default SystemContent;
