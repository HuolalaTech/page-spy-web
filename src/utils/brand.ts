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
  osName: SpyDevice.OS | 'Unknown';
  osVersion: string;
  browserName: SpyDevice.Browser | 'Unknown';
  browserVersion: string;
  osLogo?: string;
  browserLogo?: string;
}

export const OS_LOGO: Record<SpyDevice.OS, string> = {
  // os
  ios: iOSSvg,
  ipad: iOSSvg,
  mac: pcSvg,
  windows: windowsSvg,
  android: androidSvg,
  linux: linuxSvg,
  harmony: harmonySvg,
  unknown: pcSvg,
};

export const BROWSER_CONFIG: Record<
  SpyDevice.Browser,
  {
    logo: string;
    name: string;
  }
> = {
  chrome: { logo: chromeSvg, name: 'Chrome' },
  firefox: { logo: firefoxSvg, name: 'Firefox' },
  safari: { logo: safariSvg, name: 'Safari' },
  edge: { logo: edgeSvg, name: 'Edge' },
  'mp-wechat': { logo: mpWechatSvg, name: t('common.mpwechat') },
  'mp-alipay': { logo: mpAlipaySvg, name: t('common.mpalipay') },
  'mp-douyin': { logo: mpWechatSvg, name: t('common.mpdoyin') },
  wechat: { logo: wechatSvg, name: 'WeChat' },
  qq: { logo: qqSvg, name: 'QQ' },
  uc: { logo: ucSvg, name: 'UC' },
  baidu: { logo: baiduSvg, name: 'Baidu' },
  unknown: { logo: pcSvg, name: 'Unknown' },
};

export const getBrowserLogo = (browser: SpyDevice.Browser) => {
  return BROWSER_CONFIG[browser]?.logo || browserSvg;
};

export const getOSLogo = (os: SpyDevice.OS) => {
  return OS_LOGO[os] || pcSvg;
};

export const getBrowserName = (browser: SpyDevice.Browser) => {
  return BROWSER_CONFIG[browser]?.name || 'Unknown';
};

export const parseDeviceInfo = (device: string): DeviceInfo => {
  const reg = /(.*)\/(.*)\s(.*)\/(.*)/;
  const result = device.match(reg);
  if (result === null)
    return {
      osName: 'Unknown',
      osVersion: 'Unknown',
      browserName: 'Unknown',
      browserVersion: 'Unknown',
    };

  const [_, osName, osVersion, browserName, browserVersion] = result;
  return {
    osName,
    osVersion,
    browserName,
    browserVersion,
    osLogo: getOSLogo(osName as any),
    browserLogo: getBrowserLogo(browserName as any),
  } as DeviceInfo;
};

export function useClientInfo() {
  const systemMsg = useSocketMessageStore((state) => state.systemMsg);
  const system = systemMsg?.[0]?.system;
  if (system) {
    return {
      ...system,
      osLogo: getOSLogo(system.osName),
      browserLogo: getBrowserLogo(system.browserName),
    };
  }
  return null;
}
