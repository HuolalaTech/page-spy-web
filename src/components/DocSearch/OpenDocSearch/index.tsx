import Icon, { SearchOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import { useTranslation } from 'react-i18next';
import './index.less';

export const OPEN_SEARCH_EVENT = 'open-doc-search';

export const OpenDocSearch = () => {
  const { t } = useTranslation();
  return (
    <div
      className="open-cmdk-button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
      }}
    >
      <Flex
        justify="space-between"
        gap={24}
        align="center"
        wrap={false}
        className="for-pc"
      >
        <Flex align="center" gap={4}>
          <SearchOutlined />
          <span>{t('common.search')}</span>
        </Flex>
        <Flex align="center" gap={4}>
          <span>⌘</span>
          <span>K</span>
        </Flex>
      </Flex>
      <Icon
        component={SearchOutlined as React.ForwardRefExoticComponent<any>}
        style={{ fontSize: 20 }}
        className="for-mobile"
      />
    </div>
  );
};
