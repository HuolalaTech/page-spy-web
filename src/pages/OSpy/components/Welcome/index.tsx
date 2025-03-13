import { Button, Flex, Modal, Popover } from 'antd';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import LinkSvg from '@/assets/image/link.svg?react';
import CodeBlockSvg from '@/assets/image/code-block.svg?react';
import Icon from '@ant-design/icons';
import { ImportGuide } from '../ImportGuide';
import { useState } from 'react';
import './index.less';
import { useSize } from 'ahooks';
import { SelectLogButton } from '@/components/SelectLogButton';

const InstallSdkButton = () => {
  const { t } = useTranslation();
  const size = useSize(document.body);
  const [open, setOpen] = useState(false);

  if (!size) return null;

  if (size.width <= 768) {
    return (
      <>
        <Modal
          open={open}
          title={<h3>{t('oSpy.import-use')}</h3>}
          width="95%"
          style={{ maxWidth: 800 }}
          onCancel={() => setOpen(false)}
          footer={null}
          maskClosable
        >
          <ImportGuide showConfig={false} />
        </Modal>
        <Button
          type="primary"
          size="large"
          icon={<Icon component={CodeBlockSvg} style={{ fontSize: 20 }} />}
          onClick={() => {
            setOpen(true);
          }}
        >
          <b>{t('oSpy.import-use')}</b>
        </Button>
      </>
    );
  }
  return (
    <Popover
      title={<h3>{t('oSpy.import-use')}</h3>}
      content={<ImportGuide showConfig={false} />}
      trigger="click"
      overlayInnerStyle={{ width: 800 }}
    >
      <Button
        type="primary"
        size="large"
        icon={<Icon component={CodeBlockSvg} style={{ fontSize: 20 }} />}
      >
        <b>{t('oSpy.import-use')}</b>
      </Button>
    </Popover>
  );
};

export const Welcome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Flex justify="center" align="center" className="welcome">
      <Flex align="flex-start" className="welcome-container">
        <div className="welcome-left">
          <p className="slogan">
            <Trans i18nKey="oSpy.slogan">
              离线记录
              <br />
              完整回放
            </Trans>
          </p>
          <p className="slogan-desc">
            <Trans i18nKey="oSpy.desc">程序不会撒谎，回放还原现场。</Trans>
          </p>
          <div className="welcome-buttons">
            <Flex gap={24}>
              <Button
                type="primary"
                size="large"
                icon={
                  <Icon component={CodeBlockSvg} style={{ fontSize: 20 }} />
                }
              >
                <Link to="docs#quick-start">
                  <b>{t('oSpy.quick-start')}</b>
                </Link>
              </Button>
              <SelectLogButton
                buttonProps={{
                  type: 'default',
                  size: 'large',
                  style: { fontWeight: '600' },
                }}
                onSelect={(url) => {
                  navigate(`?url=${url}`);
                }}
              />
            </Flex>
            <Link
              to="?url=demo"
              target="_blank"
              style={{
                color: 'white',
                textDecoration: 'underline',
                textUnderlineOffset: 4,
              }}
            >
              <Flex gap={4}>
                <span>{t('oSpy.take-try')}</span>
                <Icon component={LinkSvg} />
              </Flex>
            </Link>
          </div>
        </div>
        <div className="welcome-right">
          <ImportGuide showConfig={false} />
        </div>
      </Flex>
    </Flex>
  );
};
