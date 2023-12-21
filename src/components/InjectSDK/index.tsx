import { Modal, Space, Tabs, TabsProps } from 'antd';
import { ComponentType, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import React from 'react';
import './index.less';
import Icon from '@ant-design/icons';
import {
  IntegrationWithPlatform,
  PLATFORMS,
  PlatformName,
} from './components/IntegrationWithPlatform';

export const InjectSDKModal = ({
  children,
}: {
  children: ComponentType<{ onPopup: () => void }>;
}) => {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const tabItems: TabsProps['items'] = useMemo(() => {
    return PLATFORMS.map(({ name, icon }) => ({
      key: name,
      label: (
        <Space style={{ paddingInline: 12 }} size={0}>
          <Icon component={icon} style={{ fontSize: 24 }} />
          <span>{t(`inject.${name}.title`)}</span>
        </Space>
      ),
    }));
  }, [t]);
  const [activeTab, setActiveTab] = useState<PlatformName>(PLATFORMS[0].name);

  return (
    <>
      {React.createElement(children, {
        onPopup: () => {
          setVisible(true);
        },
      })}
      <Modal
        open={visible}
        title={t('common.inject-sdk')}
        maskClosable
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        width="90%"
        style={{
          maxWidth: 768,
        }}
        bodyStyle={{
          padding: 12,
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
      >
        <div className="inject-sdk">
          <Tabs
            items={tabItems}
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key as PlatformName);
            }}
          />
          <IntegrationWithPlatform
            platform={activeTab}
            onCloseModal={() => {
              setVisible(false);
            }}
          />
        </div>
      </Modal>
    </>
  );
};
