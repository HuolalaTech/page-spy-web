import useSearch from '@/utils/useSearch';
import { LogReplayer } from '@/components/LogReplayer';
import { SelectLogButton } from '@/components/SelectLogButton';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Space, Button, message } from 'antd';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import request from '@/apis/request';

const Replay = () => {
  const { url, fileId } = useSearch();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 处理日志下载URL
  const logUrl = useMemo(() => {
    if (url) {
      // 如果url是API请求，提取fileId并使用更安全的方式
      if (url.includes('/api/v1/log/download?fileId=')) {
        try {
          const urlObj = new URL(url, window.location.origin);
          const extractedFileId = urlObj.searchParams.get('fileId');
          if (extractedFileId) {
            return `${request.defaultPrefix}/log/download?fileId=${extractedFileId}`;
          }
        } catch (e) {
          console.error('URL解析错误:', e);
        }
      }
      return url;
    }
    if (fileId) {
      return `${request.defaultPrefix}/log/download?fileId=${fileId}`;
    }
    return '';
  }, [url, fileId]);

  const backSlot = useMemo(() => {
    return (
      <Space>
        <Link to="/log-list">
          <Button icon={<ArrowLeftOutlined />}>{t('common.back')}</Button>
        </Link>
        <SelectLogButton
          onSelect={(url) => {
            navigate(`?url=${url}`);
          }}
        />
      </Space>
    );
  }, [navigate, t]);

  return <LogReplayer url={logUrl} fileId={fileId} backSlot={backSlot} />;
};

export default Replay;
