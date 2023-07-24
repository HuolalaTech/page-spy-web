import { GithubOutlined, ReloadOutlined } from '@ant-design/icons';
import { Row, Col, Button } from 'antd';
import Title from 'antd/es/typography/Title';
import { Component, ReactNode } from 'react';
import './index.less';
import Link from 'antd/es/typography/Link';
import { Trans, useTranslation } from 'react-i18next';

const ErrorElement = ({ error }: { error: Error }) => {
  const { t } = useTranslation();
  return (
    <div className="error-boundary">
      <div className="error-container">
        <Row align="middle" gutter={32}>
          <Col>
            <div className="logo" />
          </Col>
          <Col>
            <Title level={3}>😱 {t('error.oops')}</Title>
            <p className="error-actions">
              <Trans i18nKey="error.actions">
                You can take a
                <Button
                  size="middle"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Try again
                </Button>
                or
                <Button size="middle" icon={<GithubOutlined />}>
                  <Link href={import.meta.env.VITE_GITHUB_REPO} target="_blank">
                    Report
                  </Link>
                </Button>
                the issue.
              </Trans>
            </p>
          </Col>
        </Row>
        <div className="error-detail">
          <pre>{error.stack}</pre>
        </div>
      </div>
    </div>
  );
};

export class ErrorBoundary extends Component<{ children: ReactNode }> {
  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  state: { error?: Error } = {};

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return <ErrorElement error={error} />;
  }
}
