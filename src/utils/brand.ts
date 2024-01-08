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
import { SpyDevice } from '@huolala-tech/page-spy/web';
import useSearch from './useSearch';
import { useSocketMessageStore } from '@/store/socket-message';

interface DeviceInfo {
  osName: SpyDevice.OS | 'Unknown';
  osVersion: string;
  browserName: SpyDevice.Browser | 'Unknown';
  browserVersion: string;
  osLogo?: string;
  browserLogo?: string;
}

export const OS_LOGO: Record<Exclude<SpyDevice.OS, 'Unknown'>, string> = {
  // os
  Mac: iOSSvg,
  iPad: iOSSvg,
  iPhone: iOSSvg,
  Windows: windowsSvg,
  Android: androidSvg,
  Linux: linuxSvg,
};
export const BROWSER_LOGO: Record<
  Exclude<SpyDevice.Browser, 'Unknown'>,
  string
> = {
  // browser
  Chrome: chromeSvg,
  Firefox: firefoxSvg,
  Safari: safariSvg,
  Edge: edgeSvg,
  MPWeChat: mpWechatSvg,
  WeChat: wechatSvg,
  QQ: qqSvg,
  UC: ucSvg,
  Baidu: baiduSvg,
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
    osLogo: OS_LOGO[osName as keyof typeof OS_LOGO] || pcSvg,
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
      osLogo: OS_LOGO[system.osName as keyof typeof OS_LOGO] || pcSvg,
      browserLogo:
        BROWSER_LOGO[system.browserName as keyof typeof BROWSER_LOGO] ||
        browserSvg,
    };
  }
  return null;
}
