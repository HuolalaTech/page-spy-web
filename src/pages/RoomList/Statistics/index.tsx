import { ClientRoomInfo } from '@/utils/brand';
import { Row, Col } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  data: ClientRoomInfo[];
}

export const Statistics = memo(({ data }: Props) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'connections.status',
  });

  const { active, wait, inactive } = data.reduce(
    (acc, cur) => {
      const { connections } = cur;
      let hasClient: boolean = false;
      let hasDebugger: boolean = false;

      for (let k = 0; k <= connections.length - 1; k++) {
        const { userId } = connections[k];
        if (userId === 'Client') {
          hasClient = true;
        }
        if (userId === 'Debugger') {
          hasDebugger = true;
        }
        if (hasClient && hasDebugger) break;
      }
      if (hasClient && hasDebugger) {
        acc.active.push(cur);
      } else if (hasClient) {
        acc.wait.push(cur);
      } else {
        acc.inactive.push(cur);
      }
      return acc;
    },
    {
      active: [],
      wait: [],
      inactive: [],
    } as Record<'active' | 'wait' | 'inactive', ClientRoomInfo[]>,
  );

  return (
    <Row justify="space-between" className="statistic">
      <Col className="statistics-item">
        <p>{t('active')}</p>
        <p style={{ color: '#389e0d' }}>{active.length}</p>
      </Col>
      <Col className="statistics-item">
        <p>{t('wait')}</p>
        <p style={{ color: '#faad14' }}>{wait.length}</p>
      </Col>
      <Col className="statistics-item">
        <p>{t('inactive')}</p>
        <p style={{ color: '#bfbfbf' }}>{inactive.length}</p>
      </Col>
    </Row>
  );
});
