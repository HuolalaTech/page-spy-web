import { useSocketMessageStore } from '@/store/socket-message';
import { ClearOutlined } from '@ant-design/icons';
import { Row, Col, Tooltip, Button, Select, Space } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const HeaderActions = () => {
  const { t } = useTranslation();
  const clearRecord = useSocketMessageStore((state) => state.clearRecord);
  const changeConsoleMsgFilter = useSocketMessageStore(
    (state) => state.setConsoleMsgTypeFilter,
  );

  const logLevelList = [
    { label: 'Debug', value: 'debug' },
    { label: 'Info', value: 'info' },
    {
      label: 'Warnings',
      value: 'warn',
    },
    { label: 'Errors', value: 'error' },
    { label: 'Log', value: 'log' },
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
