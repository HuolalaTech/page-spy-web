import { ComponentType, PropsWithChildren, useMemo } from 'react';
import JsDelivrSvg from '@/assets/image/jsdelivr.svg?react';
import UnpkgSvg from '@/assets/image/unpkg.svg?react';
import ChinaSvg from '@/assets/image/china.svg?react';
import NpmSvg from '@/assets/image/npm.svg?react';
import PnpmSvg from '@/assets/image/pnpm.svg?react';
import YarnSvg from '@/assets/image/yarn.svg?react';
import WebSvg from '@/assets/image/web.svg?react';
import WechatSvg from '@/assets/image/wechat.svg?react';
import AlipaySvg from '@/assets/image/alipay.svg?react';
import UniappSvg from '@/assets/image/uni.svg?react';
import ReactSvg from '@/assets/image/react.svg?react';
import HarmonySvg from '@/assets/image/harmony.svg?react';
import TaroSvg from '@/assets/image/taro.svg?react';
import NodeSvg from '@/assets/image/nodejs.svg?react';
import DockerSvg from '@/assets/image/docker.svg?react';
import { CodeBlock, GroupItem } from '@/components/CodeBlock';
import { useTranslation } from 'react-i18next';
import { Lang } from 'shiki';
import Icon from '@ant-design/icons';
import { Flex } from 'antd';

interface Props {
  items: string;
}

type MetaType =
  // cli
  | 'npm'
  | 'yarn'
  | 'pnpm'
  // cdn
  | 'domestic'
  | 'jsDelivr'
  | 'unpkg'
  // platform
  | 'web'
  | 'wechat'
  | 'alipay'
  | 'uniapp'
  | 'react'
  | 'harmony'
  | 'taro'
  | 'node'
  | 'docker';

interface Item {
  lang: string;
  meta: MetaType;
  value: string;
}

/**
 * Markdown 语法
 *
 * :::code-group
 *
 * ```bash npm
 * npm install xxx
 * ```
 *
 * ```bash yarn
 * yarn add xxx
 * ```
 *
 * ```bash pnpm
 * pnpm add xxx
 * ```
 *
 * :::
 */
export const CodeGroup = ({ items = [] }: { items: Item[] }) => {
  const { t } = useTranslation();
  const group = useMemo(() => {
    const META_MAP: Record<MetaType, { icon: ComponentType; name: string }> = {
      npm: {
        icon: NpmSvg,
        name: 'npm',
      },
      yarn: {
        icon: YarnSvg,
        name: 'Yarn',
      },
      pnpm: {
        icon: PnpmSvg,
        name: 'pnpm',
      },
      wechat: {
        icon: WechatSvg,
        name: t('common.mpwechat'),
      },
      alipay: {
        icon: AlipaySvg,
        name: t('common.mpalipay'),
      },
      uniapp: {
        icon: UniappSvg,
        name: 'UniApp',
      },
      domestic: {
        icon: ChinaSvg,
        name: t('oSpy.domestic'),
      },
      jsDelivr: {
        icon: JsDelivrSvg,
        name: 'jsDelivr',
      },
      unpkg: {
        icon: UnpkgSvg,
        name: 'unpkg',
      },
      web: {
        icon: WebSvg,
        name: 'Web',
      },
      react: {
        icon: ReactSvg,
        name: 'ReactNative',
      },
      harmony: {
        icon: HarmonySvg,
        name: t('common.harmony'),
      },
      taro: {
        icon: TaroSvg,
        name: 'Taro',
      },
      node: {
        icon: NodeSvg,
        name: 'NodeJS',
      },
      docker: {
        icon: DockerSvg,
        name: 'Docker',
      },
    };
    return items.map((item) => {
      const { lang = 'javascript', meta, value } = item;
      const { icon, name = meta } = META_MAP[meta] || {};
      const result: GroupItem = {
        lang: lang as Lang,
        code: value,
        title: (
          <Flex
            align="center"
            gap={8}
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            {icon && <Icon component={icon} style={{ fontSize: 20 }} />}
            <span>{name}</span>
          </Flex>
        ),
      };
      return result;
    });
  }, [items, t]);

  return <CodeBlock group={group} />;
};
