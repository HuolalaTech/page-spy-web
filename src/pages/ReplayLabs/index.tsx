import { CodeBlock } from '@/components/CodeBlock';
import './index.less';
import { Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import WholeBundle from '@huolala-tech/page-spy-plugin-whole-bundle';
import '@huolala-tech/page-spy-plugin-whole-bundle/dist/index.css';
import { useEffect } from 'react';
import { getReplayUrl } from '../LogList/SelectLogButton';
import { isDoc } from '@/utils/constants';
import { useThreshold } from '@/utils/useThreshold';
import { useTranslation } from 'react-i18next';

export const ReplayLabs = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'lab' });
  const isMobile = useThreshold();

  useEffect(() => {
    if (isMobile) return;
    const $wholeBundle = new WholeBundle({
      replayLabUrl: isDoc
        ? 'https://pagespy.org/#/replay-lab'
        : `${location.protocol}//${window.DEPLOY_BASE_PATH}/#/replay-lab`,
    });
    return () => {
      $wholeBundle.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="replay-lab">
      <h1 style={{ textAlign: isMobile ? 'center' : 'right' }}>
        {t('welcome')}
      </h1>
      <div
        className="statement"
        style={{ textAlign: isMobile ? 'center' : 'right' }}
      >
        {t('statement')}
      </div>

      {isMobile ? (
        <h3 style={{ marginTop: 150 }}>{t('only-pc')}</h3>
      ) : (
        <>
          <h2 style={{ marginTop: 150 }}>{t('one-line')}</h2>
          <h2>{t('load-pageSpy')}</h2>
          <CodeBlock code='<script src="https://www.pagespy.org/plugin/whole-bundle/index.min.js" crossorigin="anonymous"></script>' />

          <h2 style={{ marginTop: '50vh' }}>{t('then')}</h2>
          <h2>{t('feedback-demo')}</h2>
          <h2>{t('try-click')}</h2>

          <h2 style={{ marginTop: '50vh' }}>{t('after')}</h2>
          <h2>{t('click-upload')}</h2>
          <Upload
            accept=".json"
            maxCount={1}
            customRequest={async (file) => {
              const url = URL.createObjectURL(file.file as File);
              let replayURL = getReplayUrl(url);
              if (isDoc) {
                replayURL = `https://pagespy.org/#/replay?url=${url}#Console`;
              }
              setTimeout(() => {
                window.open(replayURL);
              }, 50);
              return null;
            }}
            itemRender={() => null}
          >
            <Button
              size="large"
              icon={<UploadOutlined />}
              style={{ marginTop: 40, fontWeight: 700 }}
            >
              {t('upload-btn')}
            </Button>
          </Upload>

          <h2 style={{ marginTop: '50vh' }}>{t('congratulation')}</h2>
          <h2>Talk is cheap, the code is shown.</h2>
          <h4 style={{ marginTop: 20 }}>{t('desc')}</h4>
        </>
      )}
    </div>
  );
};
