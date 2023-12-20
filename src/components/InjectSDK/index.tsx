import { Modal } from 'antd';
import { ComponentType, useCallback, useMemo, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { CodeBlock } from '../CodeBlock';
import React from 'react';
import './index.less';
import { Link } from 'react-router-dom';

export const InjectSDKModal = ({
  children,
}: {
  children: ComponentType<{ onPopup: () => void }>;
}) => {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const steps = useMemo(() => {
    return [
      {
        title: t('inject.load-script'),
        code: `<script crossorigin="anonymous" src="${window.location.origin}/page-spy/index.min.js"></script>`,
      },
      {
        title: (
          <Trans i18nKey="inject.init-instance">
            <span>slot-0</span>
            <a
              href="https://github.com/HuolalaTech/page-spy?tab=readme-ov-file#%E5%AE%9E%E4%BE%8B%E5%8C%96%E5%8F%82%E6%95%B0"
              target="_blank"
            >
              slot-1
            </a>
          </Trans>
        ),
        code: `<script>
  window.$pageSpy = new PageSpy();
</script>`,
      },
      {
        title: (
          <span>
            {t('inject.end')}{' '}
            <Trans i18nKey="inject.start-debug">
              Start debugging by clicking the
              <Link
                to="/room-list"
                onClickCapture={() => {
                  setVisible(false);
                }}
              >
                Connections
              </Link>{' '}
              menu at the top!
            </Trans>
          </span>
        ),
        code: '',
      },
    ];
  }, [t]);

  const onPopup = useCallback(() => {
    setVisible(true);
  }, []);

  return (
    <>
      {React.createElement(children, { onPopup })}
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
          {steps.map(({ title, code }, index) => {
            return (
              <div className="inject-steps" key={index}>
                <p className="inject-steps__title">
                  {index + 1}. {title}
                </p>
                <CodeBlock code={code} />
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
};
