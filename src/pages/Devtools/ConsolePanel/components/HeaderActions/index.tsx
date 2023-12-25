import { useSocketMessageStore } from '@/store/socket-message';
import { ClearOutlined } from '@ant-design/icons';
import { Row, Col, Tooltip, Button, Select, Space } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const HeaderActions = () => {
  const { t } = useTranslation();
  const [clearRecord, changeConsoleMsgFilter] = useSocketMessageStore(
    (state) => [state.clearRecord, state.setConsoleMsgTypeFilter],
  );

  const logLevelList = [
    { label: 'User messages', value: 'log' },
    { label: 'Errors', value: 'error' },
    {
      label: 'Warnings',
      value: 'warn',
    },
    { label: 'Info', value: 'info' },
    { label: 'Verbose', value: 'debug' },
  ];

  const clear = useCallback(() => {
    clearRecord('console');
  }, [clearRecord]);
  return (
    <Row justify="end">
      <Col>
        <Space>
          <Select
            onChange={changeConsoleMsgFilter}
            maxTagCount="responsive"
            mode="multiple"
            options={logLevelList}
            placeholder="Log Level Filter"
            style={{ width: 200 }}
          />
          <Tooltip title={t('common.clear')}>
            <Button onClick={clear}>
              <ClearOutlined />
            </Button>
          </Tooltip>
        </Space>
      </Col>
    </Row>
  );
};
