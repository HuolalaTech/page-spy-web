import { useSocketMessageStore } from '@/store/socket-message';
import { ClearOutlined, SaveOutlined } from '@ant-design/icons';
import { Row, Col, Tooltip, Button, Select, Space } from 'antd';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ProxyType } from '@huolala-tech/page-spy/dist/types/lib/console';
import { ReactComponent as ErrorSvg } from '@/assets/image/error.svg';
import { ReactComponent as InfoSvg } from '@/assets/image/info.svg';
import { ReactComponent as WarnSvg } from '@/assets/image/warn.svg';
import { ReactComponent as UserSvg } from '@/assets/image/user.svg';
import { ReactComponent as DebugSvg } from '@/assets/image/debug.svg';
import './index.less';
import { objectToFile } from '@/utils/file';

export const HeaderActions = () => {
  const { t } = useTranslation();
  const [clearRecord, changeConsoleMsgFilter] = useSocketMessageStore(
    (state) => [state.clearRecord, state.setConsoleMsgTypeFilter],
  );

  const logLevelList: Array<{
    label: string | React.ReactNode;
    value: ProxyType;
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

  const save = useCallback(() => {
    const hash = window.location.hash.split('?')?.[1] ?? '';
    const params = new URLSearchParams(hash);
    const address =
      params.get('address')?.split('-')?.[0]?.slice(0, 4) ?? 'unknown';
    const state = useSocketMessageStore.getState();
    const { systemMsg } = state;
    const [systemMsgItem] = systemMsg ?? [
      {
        system: {
          browserName: 'unknown',
          browserVersion: '-1.-1.-1',
          osName: 'unknown',
          osVersion: '-1.-1.-1',
        },
      },
    ];
    const {
      system: { osName, osVersion, browserName, browserVersion },
    } = systemMsgItem;
    const version = osName + osVersion + '_' + browserName + browserVersion;
    const filename = `${version}_${address}.json`;

    const messageKeys = [
      'consoleMsg',
      'networkMsg',
      'systemMsg',
      'connectMsg',
      'pageMsg',
      'storageMsg',
      'databaseMsg',
    ] as const;
    type SocketMessages = {
      [Key in (typeof messageKeys)[number]]?: any;
    };
    const filteredMessages = messageKeys.reduce((acc, key) => {
      if (state[key]) {
        acc[key] = state[key];
      }
      return acc;
    }, {} as Partial<SocketMessages>);

    objectToFile(filteredMessages, filename);
  }, []);
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
          <Tooltip title="Save as JSON">
            <Button onClick={save}>
              <SaveOutlined />
            </Button>
          </Tooltip>
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
