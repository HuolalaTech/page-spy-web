import { useSocketMessageStore } from '@/store/socket-message';
import { ClearOutlined } from '@ant-design/icons';
import { Row, Col, Tooltip, Button } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const HeaderActions = () => {
  const { t } = useTranslation();
  const clearRecord = useSocketMessageStore((state) => state.clearRecord);

  const clear = useCallback(() => {
    clearRecord('console');
  }, [clearRecord]);
  return (
    <Row justify="end">
      <Col>
        <Tooltip title={t('common.clear')}>
          <Button onClick={clear}>
            <ClearOutlined />
          </Button>
        </Tooltip>
      </Col>
    </Row>
  );
};
