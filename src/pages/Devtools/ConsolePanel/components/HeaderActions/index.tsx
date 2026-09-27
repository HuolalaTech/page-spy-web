import { useSocketMessageStore } from '@/store/socket-message';
import { ClearOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  Row,
  Col,
  Tooltip,
  Button,
  Input,
  Select,
  Space,
  Dropdown,
  message,
} from 'antd';
import type { MenuProps } from 'antd';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SpyConsole } from '@huolala-tech/page-spy-types';
import ErrorSvg from '@/assets/image/error.svg?react';
import InfoSvg from '@/assets/image/info.svg?react';
import WarnSvg from '@/assets/image/warn.svg?react';
import UserSvg from '@/assets/image/user.svg?react';
import DebugSvg from '@/assets/image/debug.svg?react';
import './index.less';
import { debounce } from 'lodash-es';
import { useShallow } from 'zustand/react/shallow';
import { downloadConsoleExport, formatConsoleExport } from '../../utils/export';
import type { ConsoleExportFormat } from '../../utils/export';
export const HeaderActions = () => {
  const { t } = useTranslation();
  const [clearRecord, changeConsoleMsgFilter, setConsoleMsgKeywordFilter] =
    useSocketMessageStore(
      useShallow((state) => [
        state.clearRecord,
        state.setConsoleMsgTypeFilter,
        state.setConsoleMsgKeywordFilter,
      ]),
    );

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

  const exportItems: MenuProps['items'] = [
    {
      key: 'json',
      label: t('console.export-json'),
    },
    {
      key: 'md',
      label: t('console.export-md'),
    },
  ];

  const clear = useCallback(() => {
    clearRecord('console');
  }, [clearRecord]);

  const exportConsole = useCallback(
    (format: ConsoleExportFormat) => {
      const snapshot = [...useSocketMessageStore.getState().consoleMsg];
      if (!snapshot.length) {
        message.info(t('console.export-empty'));
        return;
      }

      const result = formatConsoleExport(snapshot, format, t);
      downloadConsoleExport(result.content, format);
      if (result.hasPreviewOnlyLog) {
        message.warning(t('console.export-preview-warning'));
        return;
      }
      message.success(t('console.export-success'));
    },
    [t],
  );

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
          <Dropdown
            menu={{
              items: exportItems,
              onClick: ({ key }) => exportConsole(key as ConsoleExportFormat),
            }}
          >
            <Button>
              <DownloadOutlined />
              {t('console.export')}
            </Button>
          </Dropdown>
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
