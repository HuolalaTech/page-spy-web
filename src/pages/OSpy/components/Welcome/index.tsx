import { Button, Flex, Popover, Upload } from 'antd';
import { useStepStore } from '../store';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import LinkSvg from '@/assets/image/link.svg?react';
import CodeBlockSvg from '@/assets/image/code-block.svg?react';
import PaperClipSvg from '@/assets/image/paper-clip.svg?react';
import Icon from '@ant-design/icons';
import { ImportGuide } from '../ImportGuide';
import { useEffect } from 'react';
import demo from './demo.json?url';
import { useThreshold } from '@/utils/useThreshold';
import './index.less';

export const Welcome = () => {
  const { t } = useTranslation();
  const [next, setReplayUrl] = useStepStore((state) => [
    state.next,
    state.setReplayUrl,
  ]);

  const gotoReplay = (blob: string) => {
    setReplayUrl(blob);
    next();
  };

  const { search } = useLocation();
  useEffect(() => {
    if (search.includes('?demo')) {
      gotoReplay(demo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMobile = useThreshold(414);

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
            即插即用
          </Trans>
        </p>
        <p className="slogan-desc">
          <Trans i18nKey="oSpy.desc">
            几行代码，回看程序运行现场
            <br />
            数据都在本地，不经过网络传输，无需担心隐私泄露
          </Trans>
        </p>
        <Flex gap={24} vertical={isMobile} justify="center" align="center">
          <Flex gap={24}>
            <Popover
              content={ImportGuide}
              trigger="click"
              overlayInnerStyle={{ maxWidth: 800 }}
            >
              <Button
                type="primary"
                size="large"
                icon={
                  <Icon component={CodeBlockSvg} style={{ fontSize: 20 }} />
                }
              >
                <b>{t('oSpy.import-use')}</b>
              </Button>
            </Popover>

            <Upload
              accept=".json"
              maxCount={1}
              customRequest={(file) => {
                const blob = URL.createObjectURL(file.file as File);
                gotoReplay(blob);
              }}
              itemRender={() => null}
            >
              <Button
                size="large"
                icon={
                  <Icon component={PaperClipSvg} style={{ fontSize: 20 }} />
                }
              >
                <b>{t('oSpy.select-log')}</b>
              </Button>
            </Upload>
          </Flex>
          <Link
            to="?demo"
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
