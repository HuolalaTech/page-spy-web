// os
import windowsSvg from '@/assets/image/windows.svg';
import iOSSvg from '@/assets/image/apple.svg';
import androidSvg from '@/assets/image/android.svg';
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

export const OS_LOGO: Record<Exclude<SpyDevice.OS, 'unknown'>, string> = {
  // os
  ios: iOSSvg,
  ipad: iOSSvg,
  mac: pcSvg,
  windows: windowsSvg,
  android: androidSvg,
  linux: linuxSvg,
  harmony: androidSvg,
};
export const BROWSER_LOGO: Record<
  Exclude<SpyDevice.Browser, 'unknown'>,
  string
> = {
  // browser
  chrome: chromeSvg,
  firefox: firefoxSvg,
  safari: safariSvg,
  edge: edgeSvg,
  'mp-wechat': mpWechatSvg,
  'mp-alipay': mpWechatSvg,
  'mp-douyin': mpWechatSvg,
  wechat: wechatSvg,
  qq: qqSvg,
  uc: ucSvg,
  baidu: baiduSvg,
  // TODO uniapp
};

export const getBrowserLogo = (browser: string) => {
  return (
    Object.entries(BROWSER_LOGO).find(([key, value]) => {
      return key.toLowerCase() === browser.toLowerCase();
    })?.[1] || browserSvg
  );
};

export const getOSLogo = (os: string) => {
  return (
    Object.entries(OS_LOGO).find(([key, value]) => {
      return key.toLowerCase() === os.toLowerCase();
    })?.[1] || pcSvg
  );
};

export const getBrowserName = (browser: string) => {
  return (
    {
      MPWeChat: t('common.mpwechat'),
    }[browser] || browser
  );
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
    osLogo: getOSLogo(osName),
    browserLogo:
      BROWSER_LOGO[browserName as keyof typeof BROWSER_LOGO] || browserSvg,
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
