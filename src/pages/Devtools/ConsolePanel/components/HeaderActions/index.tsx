import { useSocketMessageStore } from '@/store/socket-message';
import { ClearOutlined } from '@ant-design/icons';
import { Row, Col, Tooltip, Button, Input, Select, Space } from 'antd';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SpyConsole } from '@huolala-tech/page-spy-types';
import { ReactComponent as ErrorSvg } from '@/assets/image/error.svg';
import { ReactComponent as InfoSvg } from '@/assets/image/info.svg';
import { ReactComponent as WarnSvg } from '@/assets/image/warn.svg';
import { ReactComponent as UserSvg } from '@/assets/image/user.svg';
import { ReactComponent as DebugSvg } from '@/assets/image/debug.svg';
import './index.less';
import { debounce } from 'lodash-es';

export const HeaderActions = () => {
  const { t } = useTranslation();
  const [clearRecord, changeConsoleMsgFilter, setConsoleMsgKeywordFilter] =
    useSocketMessageStore((state) => [
      state.clearRecord,
      state.setConsoleMsgTypeFilter,
      state.setConsoleMsgKeywordFilter,
    ]);

  const logLevelList: Array<{
    label: string | React.ReactNode;
    value: SpyConsole.ProxyType;
  }> = [
    {
      label: (
        <div className="select-item">
          <UserSvg style={{ height: 15, width: 15 }} />
          <span className="select-item label-text">User messages</span>
        </div>
      ),
      value: 'log',
    },
    {
      label: (
        <div className="select-item">
          <ErrorSvg style={{ height: 15, width: 15 }} />
          <span className="select-item label-text">Errors</span>
        </div>
      ),
      value: 'error',
    },
    {
      label: (
        <div className="select-item">
          <WarnSvg style={{ height: 15, width: 15 }} />
          <span className="select-item label-text">Warnings</span>
        </div>
      ),
      value: 'warn',
    },
    {
      label: (
        <div className="select-item">
          <InfoSvg style={{ height: 15, width: 15 }} />
          <span className="select-item label-text">Info</span>
        </div>
      ),
      value: 'info',
    },
    {
      label: (
        <div className="select-item">
          <DebugSvg style={{ height: 15, width: 15 }} />
          <span className="select-item label-text">Verbose</span>
        </div>
      ),
      value: 'debug',
    },
  ];

  const clear = useCallback(() => {
    clearRecord('console');
  }, [clearRecord]);

  const debounceKeywordFilter = useCallback(
    debounce((e) => {
      setConsoleMsgKeywordFilter(e.target.value);
    }, 300),
    [],
  );

  return (
    <Row justify="end">
      <Col>
        <Space>
          <Select
            onChange={changeConsoleMsgFilter}
            maxTagCount="responsive"
            mode="multiple"
            allowClear={true}
            options={logLevelList}
            placeholder="Log Level Filter"
            style={{ width: 200 }}
          />
          <Input
            onChange={debounceKeywordFilter}
            placeholder="Keyword Filter"
            allowClear={true}
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
