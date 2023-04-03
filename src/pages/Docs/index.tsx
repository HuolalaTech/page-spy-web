import UsageZh from './md/usage-zh.mdx';
import UsageEn from './md/usage-en.mdx';
import './index.less';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';

export const Docs = () => {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;

  return (
    <div className="docs">
      <Row justify="center">
        <Col span={14}>{lang === 'zh' ? <UsageZh /> : <UsageEn />}</Col>
      </Row>
    </div>
  );
};
