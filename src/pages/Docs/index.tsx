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
      <div className="docs-content">
        {lang === 'zh' ? <UsageZh /> : <UsageEn />}
      </div>
    </div>
  );
};
