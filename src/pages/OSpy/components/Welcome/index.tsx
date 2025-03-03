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

  if (size.height <= 850) {
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
          <ImportGuide />
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
      content={<ImportGuide />}
      trigger="click"
      overlayInnerStyle={{ maxWidth: 800 }}
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

  const size = useSize(document.body);

  return (
    <Flex justify="center" align="center" className="welcome">
      <Flex
        vertical
        justify="center"
        align="center"
        gap={40}
        style={{ marginBottom: 100 }}
      >
        <p className="slogan">
          <Trans i18nKey="oSpy.slogan">
            离线记录
            <br />
            完整回放
          </Trans>
        </p>
        <p className="slogan-desc">
          <Trans i18nKey="oSpy.desc">
            一行代码记录现场，本地数据安心存放。
          </Trans>
        </p>
        <Flex
          gap={24}
          vertical={Number(size?.width) <= 440}
          justify="center"
          align="center"
        >
          <Flex gap={24}>
            <InstallSdkButton />
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
        </Flex>
      </Flex>
    </Flex>
  );
};
