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
import mpQQSvg from '@/assets/image/mp-qq.svg';
import mpDouyinSvg from '@/assets/image/mp-douyin.svg';
import mpJDSvg from '@/assets/image/mp-jd.svg';
import mpKuaishouSvg from '@/assets/image/mp-kuaishou.svg';
import mpBaiduSvg from '@/assets/image/mp-baidu.svg';
import mpFeishuSvg from '@/assets/image/mp-feishu.svg';
import mpDingtalkSvg from '@/assets/image/mp-dingtalk.svg';
import mpAlipaySvg from '@/assets/image/mp-alipay.svg';
import mpXhsSvg from '@/assets/image/mp-xhs.svg';

import uniSvg from '@/assets/image/uni.svg';
import { SpyDevice } from '@huolala-tech/page-spy-types';
import { useSocketMessageStore } from '@/store/socket-message';
import { t } from 'i18next';
import { Framework } from '@huolala-tech/page-spy-types/lib/device';

interface OSInfo {
  type: SpyDevice.OS;
  name: string;
  version: string;
  logo?: string;
}

interface BrowserInfo {
  type: SpyDevice.Browser;
  name: string;
  version: string;
  logo?: string;
}
export interface ClientInfo {
  os: OSInfo;
  browser: BrowserInfo;
  framework?: Framework;
}

// Make miniprogram browser types
export const AllMPTypes: SpyDevice.MPType[] = [
  'mp-wechat',
  'mp-alipay',
  'mp-qq',
  'mp-baidu',
  'mp-toutiao',
  'mp-douyin',
  'mp-lark',
  'mp-kuaishou',
  'mp-jd',
  'mp-toutiao-lt',
  'mp-douyin-lt',
  'mp-douyin-huoshan',
  'mp-xigua',
  'mp-ppx',
  'mp-dingtalk',
  'mp-xhs',
  'mp-uni', // uniapp 自研小程序引擎
];

export const AllBrowserTypes: SpyDevice.Browser[] = [
  'chrome',
  'edge',
  'firefox',
  'safari',
  'baidu',
  'uc',
  'wechat',
  'qq',
  'uni-native',
  'unknown',
];

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
  harmony: { logo: harmonySvg, label: 'Open Harmony' },
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
  wechat: { logo: wechatSvg, label: 'WeChat' },
  qq: { logo: qqSvg, label: 'QQ' },
  uc: { logo: ucSvg, label: 'UC' },
  baidu: { logo: baiduSvg, label: 'Baidu' },
  unknown: { logo: pcSvg, label: 'Unknown' },
  'mp-wechat': { logo: mpWechatSvg, label: t('common.mpwechat') },
  'mp-qq': { logo: mpQQSvg, label: t('common.mpqq') },
  'mp-alipay': { logo: mpAlipaySvg, label: t('common.mpalipay') },
  'mp-douyin': { logo: mpDouyinSvg, label: t('common.mpdouyin') },
  'mp-toutiao': { logo: mpDouyinSvg, label: t('common.mptoutiao') },
  'mp-baidu': { logo: mpBaiduSvg, label: t('common.mpbaidu') },
  'mp-lark': { logo: mpFeishuSvg, label: t('common.mpfeishu') },
  'mp-kuaishou': { logo: mpKuaishouSvg, label: t('common.mpkuaishou') },
  'mp-jd': { logo: mpJDSvg, label: t('common.mpjd') },
  'mp-toutiao-lt': { logo: mpDouyinSvg, label: t('common.mptoutiaolt') },
  'mp-douyin-lt': { logo: mpDouyinSvg, label: t('common.mpdouyinlt') },
  'mp-douyin-huoshan': { logo: mpDouyinSvg, label: t('common.mphuoshan') },
  'mp-xigua': { logo: mpDouyinSvg, label: t('common.mpxigua') },
  'mp-ppx': { logo: mpDouyinSvg, label: t('common.mpppx') },
  'mp-dingtalk': { logo: mpDingtalkSvg, label: t('common.mpdingtalk') },
  'mp-xhs': { logo: mpXhsSvg, label: t('common.mpxhs') },
  'mp-uni': { logo: uniSvg, label: 'Uni APP' },
  'uni-native': { logo: uniSvg, label: 'Uni APP' },
};

export const getOSName = (os: string) => {
  return OS_CONFIG[os.toLowerCase() as SpyDevice.OS]?.label || 'Unknown';
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

const MP_REGEXPS = {} as Record<SpyDevice.MPType, RegExp>;

AllMPTypes.forEach((mpType) => {
  MP_REGEXPS[mpType] = new RegExp(`${mpType}/([\\d.]+)`);
});

const BROWSER_REGEXPS = {
  wechat: /MicroMessenger\/([\d.]+)/,
  qq: /(?:QQBrowser|MQQBrowser|QQ)\/([\d.]+)/,
  uc: /(?:UCBrowser|UCBS)\/([\d.]+)/,
  baidu: /(?:BIDUBrowser|baiduboxapp)[/]?([\d.]*)/,
  edge: /Edg(?:e|A|iOS)?\/([\d.]+)/,
  chrome: /(?:Chrome|CriOS)\/([\d.]+)/,
  firefox: /(?:Firefox|FxiOS)\/([\d.]+)/,
  safari: /Version\/([\d.]+).*Safari/,
  'uni-native': /uni-native\/([\d.]+)/,
  ...MP_REGEXPS,
} as Record<SpyDevice.Browser, RegExp>;

const OS_REGEXPS = {
  windows: /(Windows NT |windows\/)([\d_.]+)/,
  ios: /(iPhone OS |ios\/)([\d_.]+)/,
  ipad: /iPad.*OS ([\d_.]+)/,
  mac: /(Mac OS X |macos\/)([\d_.]+)/,
  android: /(Android |android\/)([\d_.]+)/,
  linux: /Linux/,
  harmony: /(OpenHarmony )([\d_.]+)/,
} as Record<SpyDevice.OS, RegExp>;

export function parseUserAgent(
  uaString: string = window.navigator.userAgent,
): ClientInfo {
  const osInfo: OSInfo = {
    type: 'unknown',
    name: 'Unknown',
    version: 'Unknown',
  };
  const browserInfo: BrowserInfo = {
    type: 'unknown',
    name: 'Unknown',
    version: 'Unknown',
  };

  // 判断操作系统
  for (const key in OS_REGEXPS) {
    if (Object.hasOwn(OS_REGEXPS, key)) {
      const os = key as SpyDevice.OS;
      const reg = OS_REGEXPS[os as SpyDevice.OS];
      const match = uaString.match(reg);
      if (match) {
        osInfo.type = os;
        osInfo.version = match[match.length - 1]?.replaceAll('_', '.');
        break;
      }
    }
  }

  // 判断浏览器
  for (const key in BROWSER_REGEXPS) {
    if (Object.hasOwn(BROWSER_REGEXPS, key)) {
      const browser = key as SpyDevice.Browser;
      const match = uaString.match(BROWSER_REGEXPS[browser]);
      if (match) {
        browserInfo.type = browser;
        // eslint-disable-next-line prefer-destructuring
        browserInfo.version = match[1];
        break;
      }
    }
  }
  osInfo.name = getOSName(osInfo.type);
  osInfo.logo = getOSLogo(osInfo.type);
  browserInfo.name = getBrowserName(browserInfo.type);
  browserInfo.logo = getBrowserLogo(browserInfo.type);

  return {
    os: osInfo,
    browser: browserInfo,
  };
}

// export const parseDeviceInfo = (device: string): DeviceInfo => {
//   const reg = /(.*)\/(.*)\s(.*)\/(.*)/;
//   const result = device.match(reg);
//   if (result === null)
//     return {
//       osName: 'unknown',
//       osVersion: 'unknown',
//       browserName: 'unknown',
//       browserVersion: 'unknown',
//     };

//   const [_, osName, osVersion, browserName, browserVersion] = result;
//   return {
//     osName: osName.toLowerCase(),
//     osVersion,
//     browserName: browserName.toLowerCase(),
//     browserVersion,
//     osLogo: getOSLogo(osName.toLowerCase()),
//     browserLogo: getBrowserLogo(browserName.toLowerCase()),
//   } as DeviceInfo;
// };

// get client info from room info
// export function getClientInfoFromRoom(room: I.SpyRoom) {
//   const {name, tags} = room
//   const ua = tags.ua || name
//   return parseUserAgent(ua)
// }

// get client info from system message
export function useClientInfoFromMsg() {
  const systemMsg = useSocketMessageStore((state) => state.systemMsg);
  const system = systemMsg?.[0]?.system;
  if (system) {
    const { ua } = system;
    return parseUserAgent(ua);
  }
  return null;
}
