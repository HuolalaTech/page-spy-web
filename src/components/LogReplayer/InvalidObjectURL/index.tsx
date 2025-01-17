import useSearch from '@/utils/useSearch';
import { Button, Empty, Space } from 'antd';
import { Trans, useTranslation } from 'react-i18next';
import './index.less';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';

export const InvalidObjectURL = ({ url }: { url: string }) => {
  const { t } = useTranslation();

  return (
    <div className="invalid-object-url">
      <Empty description={null} />
      {!url ? (
        <p>{t('replay.invalid-params')}</p>
      ) : (
        <Trans i18nKey="replay.invalid-blob">
          <p>
            The parameter reading from the URL failed, the object maybe cleared:
          </p>
          <code className="blob-url">{url}</code>
        </Trans>
      )}
      <Space>
        <Button icon={<ArrowLeftOutlined />} type="primary">
          <Link to="/room-list">{t('common.connections')}</Link>
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            window.location.reload();
          }}
        >
          {t('error.try-again')}
        </Button>
      </Space>
    </div>
  );
};
