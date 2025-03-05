import { isClient } from '@/utils/constants';
import { Button, Modal } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import RunSvg from '@/assets/image/run-right.svg?react';
import Icon from '@ant-design/icons';
import { isCN } from '@/assets/locales';

const CACHE_NAME = 'page-spy-do-not-open-mirror-modal';
export const OFFICIAL_SITE = /^(w{3}.)?pagespy\.org$/;
export const CN_MIRROR_SITE = 'https://pagespy.huolala.cn';

export const CNUserModal = () => {
  const [open, setOpen] = useState(() => {
    const { host } = location;
    if (isClient || !OFFICIAL_SITE.test(host) || !isCN()) return false;

    const beforeOpenTime = localStorage[CACHE_NAME];
    if (beforeOpenTime) {
      const before = dayjs(beforeOpenTime);
      const now = dayjs();
      const diffDays = now.diff(before, 'day');
      if (diffDays < 7) {
        return false;
      }
    }

    return true;
  });

  return (
    <Modal
      open={open}
      title="🚀 提示"
      maskClosable={false}
      onCancel={() => {
        setOpen(false);
      }}
      footer={[
        <Button
          key="close"
          onClick={() => {
            localStorage.setItem(CACHE_NAME, new Date().toString());
            setOpen(false);
          }}
        >
          7 天内不再显示
        </Button>,
        <Button
          key="go"
          type="primary"
          icon={<Icon component={RunSvg} style={{ fontSize: 18 }} />}
          onClick={() => {
            window.location.href = CN_MIRROR_SITE;
          }}
        >
          立刻前往
        </Button>,
      ]}
    >
      <p style={{ marginBlock: 24, fontSize: 16 }}>
        国内用户推荐访问国内镜像站以获得最佳体验～
      </p>
    </Modal>
  );
};
