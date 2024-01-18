// os
import windowsSvg from '@/assets/image/windows.svg';
import iOSSvg from '@/assets/image/apple.svg';
import androidSvg from '@/assets/image/android.svg';
import harmonySvg from '@/assets/image/harmony.svg';
import linuxSvg from '@/assets/image/linux.svg';
import pcSvg from '@/assets/image/pc.svg';
// browser
import wechatSvg from '@/assets/image/wechat.svg';
import qqSvg from '@/assets/image/qq.svg';
import ucSvg from '@/assets/image/uc.svg';
import baiduSvg from '@/assets/image/baidu.svg';
import edgeSvg from '@/assets/image/edge.svg';
import chromeSvg from '@/assets/image/chrome.svg';
import firefoxSvg from '@/assets/image/firefox.svg';
import safariSvg from '@/assets/image/safari.svg';
import browserSvg from '@/assets/image/browser.svg';
import mpWechatSvg from '@/assets/image/miniprogram.svg';
import mpAlipaySvg from '@/assets/image/alipay.svg';
import uniSvg from '@/assets/image/uni.svg';
import { SpyDevice } from '@huolala-tech/page-spy-types';
import { useSocketMessageStore } from '@/store/socket-message';
import { t } from 'i18next';

interface DeviceInfo {
  osName: SpyDevice.OS;
  osVersion: string;
  browserName: SpyDevice.Browser;
  browserVersion: string;
  osLogo?: string;
  browserLogo?: string;
}

export const OS_CONFIG: Record<
  SpyDevice.OS,
  {
    logo: string;
    label: string;
  }
> = {
  ios: { logo: iOSSvg, label: 'iOS' },
  ipad: { logo: iOSSvg, label: 'iPad' },
  mac: { logo: iOSSvg, label: 'macOS' },
  windows: { logo: windowsSvg, label: 'Windows' },
  linux: { logo: linuxSvg, label: 'Linux' },
  android: { logo: androidSvg, label: 'Android' },
  harmony: { logo: harmonySvg, label: 'HarmonyOS' },
  unknown: { logo: pcSvg, label: 'Unknown' },
};

export const BROWSER_CONFIG: Record<
  SpyDevice.Browser,
  {
    logo: string;
    label: string;
  }
> = {
  chrome: { logo: chromeSvg, label: 'Chrome' },
  firefox: { logo: firefoxSvg, label: 'Firefox' },
  safari: { logo: safariSvg, label: 'Safari' },
  edge: { logo: edgeSvg, label: 'Edge' },
  'mp-wechat': { logo: mpWechatSvg, label: t('common.mpwechat') },
  'mp-alipay': { logo: mpAlipaySvg, label: t('common.mpalipay') },
  'mp-douyin': { logo: mpWechatSvg, label: t('common.mpdoyin') },
  wechat: { logo: wechatSvg, label: 'WeChat' },
  qq: { logo: qqSvg, label: 'QQ' },
  uc: { logo: ucSvg, label: 'UC' },
  baidu: { logo: baiduSvg, label: 'Baidu' },
  unknown: { logo: pcSvg, label: 'Unknown' },
};

export const getOSName = (os: string) => {
  return OS_CONFIG[os.toLowerCase() as SpyDevice.OS]?.label || pcSvg;
};

export const getOSLogo = (os: string) => {
  return OS_CONFIG[os.toLowerCase() as SpyDevice.OS]?.logo || pcSvg;
};

export const getBrowserName = (browser: string) => {
  return (
    BROWSER_CONFIG[browser.toLowerCase() as SpyDevice.Browser]?.label ||
    'Unknown'
  );
};

export const getBrowserLogo = (browser: string) => {
  return BROWSER_CONFIG[browser as SpyDevice.Browser]?.logo || browserSvg;
};

export const parseDeviceInfo = (device: string): DeviceInfo => {
  const reg = /(.*)\/(.*)\s(.*)\/(.*)/;
  const result = device.match(reg);
  if (result === null)
    return {
      osName: 'unknown',
      osVersion: 'unknown',
      browserName: 'unknown',
      browserVersion: 'unknown',
    };

  const [_, osName, osVersion, browserName, browserVersion] = result;
  return {
    osName: osName.toLowerCase(),
    osVersion,
    browserName: browserName.toLowerCase(),
    browserVersion,
    osLogo: getOSLogo(osName.toLowerCase()),
    browserLogo: getBrowserLogo(browserName.toLowerCase()),
  } as DeviceInfo;
};

export function useClientInfo() {
  const systemMsg = useSocketMessageStore((state) => state.systemMsg);
  const system = systemMsg?.[0]?.system;
  if (system) {
    return {
      // ...system,
      browserName: system.browserName.toLowerCase(),
      browserVersion: system.browserVersion,
      osName: system.osName.toLowerCase(),
      osVersion: system.osVersion,
      osLogo: getOSLogo(system.osName.toLowerCase()),
      browserLogo: getBrowserLogo(system.browserName.toLowerCase()),
    } as DeviceInfo;
  }
  return null;
}
